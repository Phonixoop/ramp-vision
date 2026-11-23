/**
 * v1 ↔ v2 parity and timing check.
 *
 * The v2 port is only correct if it reproduces the v1 browser pipeline exactly,
 * so this script runs both against the live database for a set of representative
 * filters and diffs the numbers:
 *
 *   - v1 path:  the same raw SQL `personnelPerformance.getAll` issues, followed
 *               by the real `distinctPersonnelPerformanceData` +
 *               `filterOutZeroPerformanceRows` helpers.
 *   - v2 path:  `getPersonnelTable` / `getPersonnelSummary`, i.e. the code the
 *               `/api/v2` routes actually call.
 *
 * Usage:
 *   node --import tsx scripts/compare-v1-v2.ts            # parity + timings
 *   node --import tsx scripts/compare-v1-v2.ts --timings  # timings only
 *
 * It never writes to the database.
 */
import { writeFileSync } from "node:fs";

import { mssqlQuery } from "../src/server/db/mssql-pool";
import {
  distinctPersonnelPerformanceData,
  filterOutZeroPerformanceRows,
} from "../src/utils/personnel-performance";
import { getPersonnelTable } from "../src/server/ramp-performance/personnel-table";
import { getPersonnelSummary } from "../src/server/ramp-performance/personnel-summary";
import type { FilterQuery, TableQuery } from "../src/server/ramp-performance/params";

/** A "latest" date is needed because users_info is a per-snapshot roster. */
const LATEST_DATE_INFO = "1405/08/30";

/** Cities big enough to exercise multi-city aggregation without full scans. */
const SAMPLE_CITIES = ["Tehran", "Tehran Direct", "Fars", "Isfahan", "Khorasan, Razavi"];

type Case = {
  name: string;
  periodType: FilterQuery["periodType"];
  dates: string[];
  cities?: string[];
};

const CASES: Case[] = [
  {
    name: "day / single city",
    periodType: "روزانه",
    dates: ["1405/08/28"],
    cities: ["Fars"],
  },
  {
    name: "day / multi city",
    periodType: "روزانه",
    dates: ["1405/08/27"],
    cities: SAMPLE_CITIES,
  },
  {
    name: "week / multi city",
    periodType: "هفتگی",
    dates: ["1405/08/22", "1405/08/28"],
    cities: SAMPLE_CITIES,
  },
  {
    name: "month / multi city (the v1 blocker)",
    periodType: "ماهانه",
    dates: ["1405/08/01"],
    cities: SAMPLE_CITIES,
  },
];

const V1_DEFAULTS = {
  ProjectType: ["ارزیابی"],
  ContractType: ["تمام وقت"],
};

/** The exact v1 query shape from personnel_performance.ts `getAll`. */
function v1Query(theCase: Case): string {
  const cities = theCase.cities ?? [];
  const cityList = cities.map((c) => `N'${c}'`).join(", ");
  const projectTypes = V1_DEFAULTS.ProjectType.map((v) => `N'${v}'`).join(", ");
  const contractTypes = V1_DEFAULTS.ContractType.map((v) => `N'${v}'`).join(", ");

  const datePredicate =
    theCase.periodType === "ماهانه"
      ? theCase.dates
          .map((d) => {
            const [year, month] = d.split("/");
            return `p.Start_Date LIKE '${year}/${month}/%'`;
          })
          .join(" OR ")
      : theCase.periodType === "هفتگی"
        ? `p.Start_Date >= '${theCase.dates[0]}' AND p.Start_Date <= '${theCase.dates[1]}'`
        : `p.Start_Date IN (${theCase.dates.map((d) => `N'${d}'`).join(", ")})`;

  return `
    SELECT p.CityName, realuser.CityName AS RealCityName, p.NameFamily, u.NationalCode,
           u.PersonnelCode, u.ProjectType, u.ContractType, u.Role, u.RoleType, u.DateInfo,
           p.HasTheDayOff, p.TownName, p.BranchCode, p.BranchName, p.BranchType,
           SUM(p.SabtAvalieAsnad) AS SabtAvalieAsnad,
           SUM(p.PazireshVaSabtAvalieAsnad) AS PazireshVaSabtAvalieAsnad,
           SUM(p.ArzyabiAsanadBimarsetaniDirect) AS ArzyabiAsanadBimarsetaniDirect,
           SUM(p.ArzyabiAsnadBimarestaniIndirect) AS ArzyabiAsnadBimarestaniIndirect,
           SUM(p.ArzyabiAsnadDandanVaParaDirect) AS ArzyabiAsnadDandanVaParaDirect,
           SUM(p.ArzyabiAsnadDandanVaParaIndirect) AS ArzyabiAsnadDandanVaParaIndirect,
           SUM(p.ArzyabiAsnadDandanDirect) AS ArzyabiAsnadDandanDirect,
           SUM(p.ArzyabiAsnadDandanIndirect) AS ArzyabiAsnadDandanIndirect,
           SUM(p.ArzyabiAsnadDaroDirect) AS ArzyabiAsnadDaroDirect,
           SUM(p.ArzyabiAsnadDaroIndirect) AS ArzyabiAsnadDaroIndirect,
           SUM(p.WithScanCount) AS WithScanCount,
           SUM(p.WithoutScanCount) AS WithoutScanCount,
           SUM(p.WithoutScanInDirectCount) AS WithoutScanInDirectCount,
           SUM(p.ArchiveDirectCount) AS ArchiveDirectCount,
           SUM(p.ArchiveInDirectCount) AS ArchiveInDirectCount,
           SUM(p.ArzyabiVisitDirectCount) AS ArzyabiVisitDirectCount,
           SUM(p.ArzyabiVisitInDirectCount) AS ArzyabiVisitInDirectCount,
           SUM(p.TotalPerformance) AS TotalPerformance,
           SUM(p.DirectPerFormance) AS DirectPerFormance,
           SUM(p.InDirectPerFormance) AS InDirectPerFormance,
           p.Start_Date
    FROM personnel_performance AS p
    JOIN users_info AS u ON p.NationalCode = u.NationalCode
    OUTER APPLY (
      SELECT TOP 1 realusr.CityName, realusr.NameFamily
      FROM users AS realusr WHERE realusr.NationalCode = p.NationalCode
    ) AS realuser
    WHERE p.CityName IS NOT NULL
      AND p.CityName IN (${cityList})
      AND u.ProjectType IN (${projectTypes})
      AND u.ContractType IN (${contractTypes})
      AND u.DateInfo = N'${LATEST_DATE_INFO}'
      AND p.HasTheDayOff = 0
      AND (${datePredicate})
    GROUP BY p.CityName, realuser.CityName, p.NameFamily, u.NationalCode, u.PersonnelCode,
             u.ProjectType, u.ContractType, u.Role, u.RoleType, u.DateInfo, p.Start_Date,
             p.HasTheDayOff, p.TownName, p.BranchCode, p.BranchName, p.BranchType
  `;
}

/** v1: run SQL, then the real browser-side aggregation helpers. */
async function runV1(theCase: Case) {
  const started = Date.now();
  const result = await mssqlQuery(v1Query(theCase));
  const sqlMs = Date.now() - started;

  const rows = result.recordsets[0] as Record<string, unknown>[];

  // v1's `dateLength` — distinct Start_Date per city.
  const unique = rows.filter(
    (row, index, self) =>
      index ===
      self.findIndex(
        (o) => o.CityName === row.CityName && o.Start_Date === row.Start_Date,
      ),
  );
  const dateLength: Record<string, number> = {};
  for (const row of unique) {
    const city = String(row.CityName);
    dateLength[city] = (dateLength[city] ?? 0) + 1;
  }

  const distinct = distinctPersonnelPerformanceData(
    { periodType: theCase.periodType, dateLength, result: rows },
    ["NationalCode", "NameFamily", "CityName"],
    [
      "TownName", "BranchCode", "BranchName", "BranchType",
      "SabtAvalieAsnad", "PazireshVaSabtAvalieAsnad",
      "ArzyabiAsanadBimarsetaniDirect", "ArzyabiAsnadBimarestaniIndirect",
      "ArzyabiAsnadDandanVaParaDirect", "ArzyabiAsnadDandanVaParaIndirect",
      "ArzyabiAsnadDandanDirect", "ArzyabiAsnadDandanIndirect",
      "ArzyabiAsnadDaroDirect", "ArzyabiAsnadDaroIndirect",
      "WithScanCount", "WithoutScanCount", "WithoutScanInDirectCount",
      "ArchiveDirectCount", "ArchiveInDirectCount",
      "ArzyabiVisitDirectCount", "ArzyabiVisitInDirectCount",
      "Role", "RoleType", "ContractType", "ProjectType", "PersonnelCode",
      "TotalPerformance", "DirectPerFormance", "InDirectPerFormance",
      "Start_Date", "DateInfo", "HasTheDayOff", "RealCityName", "NationalCode",
    ],
    { HasTheDayOff: false },
    null,
  );

  const rowsForTable = filterOutZeroPerformanceRows(distinct);

  return {
    sqlMs,
    totalMs: Date.now() - started,
    rawRows: rows.length,
    rowCount: rowsForTable.length,
    byKey: indexByKey(
      rowsForTable.map((row) => {
        const r = row as Record<string, unknown>;
        return {
          NationalCode: String(r.NationalCode ?? ""),
          CityName: String(r.CityName ?? ""),
          NameFamily: String(r.NameFamily ?? ""),
          TotalPerformance: Number(r.TotalPerformance ?? 0),
          DirectPerFormance: Number(r.DirectPerFormance ?? 0),
          InDirectPerFormance: Number(r.InDirectPerFormance ?? 0),
        };
      }),
    ),
  };
}

async function runV2(theCase: Case) {
  const filters: TableQuery = {
    periodType: theCase.periodType,
    dates: theCase.dates,
    cities: theCase.cities,
    projectTypes: V1_DEFAULTS.ProjectType,
    contractTypes: V1_DEFAULTS.ContractType,
    dateInfos: [LATEST_DATE_INFO],
    page: 1,
    pageSize: 50,
    dir: "asc",
  };

  // Time the first page (that is the number the UI feels), then walk the rest
  // of the pages so the comparison sees every row v1 produced — otherwise the
  // harness reports "missing" for anything that fell on page 2+.
  const started = Date.now();
  const firstPage = await getPersonnelTable(filters, theCase.cities ?? [], null);
  const tableMs = Date.now() - started;

  const allRows = [...firstPage.rows];
  const pageCount = Math.ceil(firstPage.total / filters.pageSize);
  const pagingStarted = Date.now();
  for (let page = 2; page <= pageCount; page += 1) {
    const next = await getPersonnelTable({ ...filters, page }, theCase.cities ?? [], null);
    if (!next.rows.length) break;
    allRows.push(...next.rows);
  }
  const pagingMs = Date.now() - pagingStarted;

  const summaryStarted = Date.now();
  await getPersonnelSummary(filters, theCase.cities ?? [], null);
  const summaryMs = Date.now() - summaryStarted;

  return {
    tableMs,
    pagingMs,
    summaryMs,
    totalMs: tableMs + summaryMs,
    total: firstPage.total,
    receivedRows: allRows.length,
    byKey: indexByKey(allRows),
  };
}

function indexByKey<T extends { NationalCode: string; CityName: string }>(rows: T[]) {
  const map = new Map<string, T>();
  for (const row of rows) map.set(`${row.NationalCode}|${row.CityName}`, row);
  return map;
}

function compare(theCase: Case, v1: Awaited<ReturnType<typeof runV1>>, v2: Awaited<ReturnType<typeof runV2>>) {
  const problems: string[] = [];

  if (v1.byKey.size !== v2.byKey.size) {
    problems.push(`row count v1=${v1.byKey.size} v2=${v2.byKey.size}`);
  }

  let compared = 0;
  let worstDelta = 0;
  const worstExamples: string[] = [];

  for (const [key, a] of v1.byKey) {
    const b = v2.byKey.get(key);
    if (!b) {
      problems.push(`missing in v2: ${key}`);
      continue;
    }
    compared += 1;

    for (const field of ["TotalPerformance", "DirectPerFormance", "InDirectPerFormance"] as const) {
      const delta = Math.abs(Number(a[field]) - Number(b[field]));
      if (delta > worstDelta) worstDelta = delta;
      // Gate: match to 2 decimals, exactly what the table displays.
      if (Number(delta.toFixed(2)) !== 0) {
        if (worstExamples.length < 5) {
          worstExamples.push(
            `${key} ${field}: v1=${Number(a[field]).toFixed(4)} v2=${Number(b[field]).toFixed(4)}`,
          );
        }
      }
    }
  }

  for (const key of v2.byKey.keys()) {
    if (!v1.byKey.has(key)) problems.push(`extra in v2: ${key}`);
  }

  const t = (n: number) => `${n}ms`;
  console.log(`\n=== ${theCase.name}`);
  console.log(
    `  v1  raw rows ${v1.rawRows}  ->  table ${v1.rowCount}  (sql ${t(v1.sqlMs)}, total ${t(v1.totalMs)})`,
  );
  console.log(
    `  v2  total ${v2.total}        ->  page ${v2.receivedRows}  (table ${t(v2.tableMs)}, summary ${t(v2.summaryMs)})`,
  );
  console.log(`  compared ${compared} rows, worst delta ${worstDelta.toExponential(2)}`);
  console.log(`  speedup: ${(v1.totalMs / Math.max(v2.tableMs, 1)).toFixed(1)}x on first page`);

  if (worstExamples.length) {
    console.log("  MISMATCHES:");
    for (const example of worstExamples) console.log(`    ${example}`);
  }
  if (problems.length) {
    console.log("  PROBLEMS:");
    for (const problem of problems.slice(0, 10)) console.log(`    ${problem}`);
  } else if (!worstExamples.length) {
    console.log("  ✓ parity to 2 decimals");
  }

  return { problems, worstDelta, speedup: v1.totalMs / Math.max(v2.tableMs, 1) };
}

/**
 * Acceptance measurement (plan Phase 6 targets).
 *
 * Unlike the parity run this measures exactly what the browser feels on the
 * page that used to be impossible: a **monthly, multi-city** filter.
 *
 *   cold   — first call of the process (buffer cache may still be cold)
 *   warm   — the same call again (SQL Server page cache hit; this is the number
 *            a user sees when paging or switching back to the same filter)
 *   payload— JSON bytes of one page, i.e. what actually crosses the wire
 *
 * Targets: cold < 2000 ms, warm < 250 ms, payload < 100 KB.
 */
const ACCEPTANCE = {
  coldMs: 2000,
  warmMs: 250,
  payloadBytes: 100 * 1024,
};

async function runAcceptance() {
  const filters: TableQuery = {
    periodType: "ماهانه",
    dates: ["1405/08/01", "1405/08/30"],
    cities: SAMPLE_CITIES,
    projectTypes: V1_DEFAULTS.ProjectType,
    contractTypes: V1_DEFAULTS.ContractType,
    dateInfos: [LATEST_DATE_INFO],
    page: 1,
    pageSize: 50,
    dir: "asc",
  };

  const coldStarted = Date.now();
  const cold = await getPersonnelTable(filters, SAMPLE_CITIES, null);
  const coldMs = Date.now() - coldStarted;

  const warmStarted = Date.now();
  const warm = await getPersonnelTable(filters, SAMPLE_CITIES, null);
  const warmMs = Date.now() - warmStarted;

  const summaryStarted = Date.now();
  const summary = await getPersonnelSummary(filters, SAMPLE_CITIES, null);
  const summaryMs = Date.now() - summaryStarted;

  const payloadBytes = Buffer.byteLength(JSON.stringify(cold));
  const summaryBytes = Buffer.byteLength(JSON.stringify(summary));

  const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;
  const verdict = (ok: boolean) => (ok ? "PASS" : "FAIL");

  console.log(`\n=== acceptance: month / ${SAMPLE_CITIES.length} cities (v1 blocker)`);
  console.log(`  rows              ${cold.total}`);
  console.log(
    `  cold    ${coldMs}ms      ${verdict(coldMs < ACCEPTANCE.coldMs)}  (target < ${ACCEPTANCE.coldMs}ms)`,
  );
  console.log(
    `  warm    ${warmMs}ms      ${verdict(warmMs < ACCEPTANCE.warmMs)}  (target < ${ACCEPTANCE.warmMs}ms)`,
  );
  console.log(`  summary ${summaryMs}ms (full-set aggregates for the footer)`);
  console.log(
    `  payload ${kb(payloadBytes)}   ${verdict(payloadBytes < ACCEPTANCE.payloadBytes)}  (target < ${kb(ACCEPTANCE.payloadBytes)}, summary ${kb(summaryBytes)})`,
  );
  console.log(
    `  multi-city monthly    ${verdict(cold.total > 0)}  (v2 does not cap it)`,
  );

  return {
    coldMs,
    warmMs,
    summaryMs,
    payloadBytes,
    rows: cold.total,
    pass:
      coldMs < ACCEPTANCE.coldMs &&
      warmMs < ACCEPTANCE.warmMs &&
      payloadBytes < ACCEPTANCE.payloadBytes &&
      cold.total > 0,
  };
}

async function main() {
  if (process.argv.includes("--acceptance")) {
    const result = await runAcceptance();
    writeFileSync("compare-v1-v2.acceptance.json", JSON.stringify(result, null, 2));
    console.log(`\nReport written to compare-v1-v2.acceptance.json`);
    if (!result.pass) process.exitCode = 1;
    return;
  }

  const timingsOnly = process.argv.includes("--timings");
  const report: Record<string, unknown>[] = [];
  let failures = 0;

  for (const theCase of CASES) {
    try {
      const v1 = await runV1(theCase);
      const v2 = await runV2(theCase);

      if (timingsOnly) {
        console.log(
          `\n=== ${theCase.name}\n  v1 ${v1.totalMs}ms (${v1.rawRows} raw rows)\n  v2 ${v2.tableMs}ms table + ${v2.summaryMs}ms summary`,
        );
        report.push({ case: theCase.name, v1Ms: v1.totalMs, v2Ms: v2.tableMs });
        continue;
      }

      const result = compare(theCase, v1, v2);
      if (result.problems.length) failures += 1;
      report.push({
        case: theCase.name,
        v1Ms: v1.totalMs,
        v2Ms: v2.tableMs,
        worstDelta: result.worstDelta,
        problems: result.problems.length,
        speedup: Number(result.speedup.toFixed(1)),
      });
    } catch (error) {
      console.error(`\n=== ${theCase.name}\n  ERROR: ${(error as Error).message}`);
      failures += 1;
      report.push({ case: theCase.name, error: (error as Error).message });
    }
  }

  writeFileSync("compare-v1-v2.report.json", JSON.stringify(report, null, 2));
  console.log(`\nReport written to compare-v1-v2.report.json`);

  if (failures) {
    console.error(`\n${failures} case(s) failed parity.`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
