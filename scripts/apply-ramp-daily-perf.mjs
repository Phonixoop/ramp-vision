#!/usr/bin/env node
/**
 * Applies / rolls back the RAMP_Daily performance migration.
 *
 *   node scripts/apply-ramp-daily-perf.mjs --preflight   # checks only, no DDL
 *   node scripts/apply-ramp-daily-perf.mjs --apply       # narrow columns + indexes
 *   node scripts/apply-ramp-daily-perf.mjs --rollback    # drop indexes, widen columns
 *   node scripts/apply-ramp-daily-perf.mjs --status      # what is applied right now
 *
 * --preflight is read-only: it runs only the guarded section of the forward
 * script, so it validates every length assumption without touching a thing.
 * --apply is idempotent; run it twice and the second run reports no-ops.
 *
 * Uses the same SQL_* env vars as the app:
 *   set -a; . ./.env; set +a
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sql from "mssql";

const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(here, "..", "db", "migrations");

const FORWARD = "2026-11-23-ramp-daily-perf.sql";
const ROLLBACK = "2026-11-23-ramp-daily-perf.rollback.sql";

const INDEXES = [
  ["personnel_performance", "IX_pp_City_StartDate"],
  ["users_info", "IX_ui_NationalCode_DateInfo"],
  ["users", "IX_users_NationalCode"],
  ["depos", "IX_depos_City_StartDate"],
];

/**
 * Columns the forward migration narrows, mirrored from its `targets` CTE.
 * Kept here only so `--status` can distinguish "not applied yet" from "applied,
 * and the tables happen to contain other MAX columns we intentionally ignore".
 */
const TARGET_COLUMNS = [
  ["personnel_performance", "Start_Date"],
  ["personnel_performance", "End_Date"],
  ["personnel_performance", "CreatedAtPersian"],
  ["personnel_performance", "NationalCode"],
  ["personnel_performance", "CityName"],
  ["personnel_performance", "NameFamily"],
  ["personnel_performance", "TownName"],
  ["personnel_performance", "BranchCode"],
  ["personnel_performance", "BranchName"],
  ["personnel_performance", "BranchType"],
  ["users_info", "NationalCode"],
  ["users_info", "PersonnelCode"],
  ["users_info", "ProjectType"],
  ["users_info", "Role"],
  ["users_info", "RoleType"],
  ["users_info", "ContractType"],
  ["users_info", "DateInfo"],
  ["users_info", "PhoneNumber"],
  ["users_info", "ContractStartDate"],
  ["users_info", "ContractEndDate"],
  ["users_info", "TotalPresence"],
  ["users_info", "ChargedPresence"],
  ["users_info", "OverTimeHour"],
  ["users", "NationalCode"],
  ["users", "CityName"],
  ["users", "NameFamily"],
  ["depos", "Start_Date"],
  ["depos", "End_Date"],
  ["depos", "CreatedAtPersian"],
  ["depos", "CityName"],
  ["depos", "ServiceName"],
  ["depos", "BillType"],
];

const has = (flag) => process.argv.includes(flag);

function config() {
  const server = process.env.SQL_SERVERIP;
  const isIpLiteral = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(server ?? "");
  return {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    server,
    port: Number(process.env.SQL_PORT ?? 1433),
    database: "RAMP_Daily",
    options: {
      encrypt: true,
      trustServerCertificate: true,
      ...(isIpLiteral ? { serverName: "localhost" } : {}),
    },
    connectionTimeout: 15_000,
    // Index builds on 1.6M rows take minutes.
    requestTimeout: 3_600_000,
  };
}

const read = (name) => readFileSync(join(migrationsDir, name), "utf8");

// Marker tokens are built from strings so this file never contains a literal
// comment terminator sequence.
const BLOCK_OPEN = "/" + "*";
const BLOCK_CLOSE = "*" + "/";

/**
 * The forward script is split by `@section:<name>` … `@section:end` comment
 * markers so the read-only preflight can be executed on its own.
 */
function section(text, name) {
  const startToken = BLOCK_OPEN + " @section:" + name;
  const endToken = BLOCK_OPEN + " @section:end";

  const startIndex = text.indexOf(startToken);
  if (startIndex === -1) throw new Error(`Section "${name}" not found.`);

  const bodyStart = text.indexOf(BLOCK_CLOSE, startIndex) + BLOCK_CLOSE.length;
  const endIndex = text.indexOf(endToken, bodyStart);
  if (endIndex === -1) throw new Error(`Section "${name}" is not terminated.`);

  return text.slice(bodyStart, endIndex).trim();
}

const batches = (text) =>
  text
    .split(/^\s*GO\s*$/gim)
    .map((b) => b.trim())
    .filter(Boolean);

async function execute(label, text) {
  const pool = await new sql.ConnectionPool(config()).connect();
  try {
    for (const [i, batch] of batches(text).entries()) {
      process.stdout.write(`  [${label}] batch ${i + 1} … `);
      const t = Date.now();
      await pool.request().query(batch);
      console.log(`${Date.now() - t} ms`);
    }
  } finally {
    await pool.close();
  }
}

async function report() {
  const pool = await new sql.ConnectionPool(config()).connect();
  try {
    console.log("Indexes");
    for (const [table, index] of INDEXES) {
      const r = await pool
        .request()
        .input("table", sql.NVarChar(128), table)
        .input("index", sql.NVarChar(128), index)
        .query(
          `SELECT i.name, p.rows, SUM(a.total_pages) * 8 / 1024.0 AS mb
             FROM sys.indexes i
             JOIN sys.partitions p ON p.object_id = i.object_id AND p.index_id = i.index_id
             JOIN sys.allocation_units a ON a.container_id = p.partition_id
            WHERE i.object_id = OBJECT_ID(@table) AND i.name = @index AND p.index_id > 0
            GROUP BY i.name, p.rows`,
        );
      const row = r.recordset[0];
      console.log(
        row
          ? `  ✓ ${index.padEnd(28)} ${table.padEnd(24)} ${row.rows} rows, ${row.mb.toFixed(1)} MB`
          : `  ✗ ${index.padEnd(28)} ${table.padEnd(24)} missing`,
      );
    }

    // Count only the columns the migration actually narrows. The four tables
    // hold a few extra NVARCHAR(MAX) columns (users.CreatedAtPersian,
    // users_info.CreatedAtPersian) that are never queried and are deliberately
    // left alone; counting every MAX column made a successful --apply still
    // report "3 remaining" and look like a failure.
    const maxCols = await pool.request().query(`
      SELECT t.name AS tbl, c.name AS col
        FROM sys.tables t
        JOIN sys.columns c ON c.object_id = t.object_id
        JOIN sys.types ty ON ty.user_type_id = c.user_type_id
        JOIN (VALUES ${TARGET_COLUMNS.map(
          ([tbl, col]) => `('${tbl}', '${col}')`,
        ).join(", ")}) AS tg(tbl, col)
          ON tg.tbl = t.name AND tg.col = c.name
       WHERE ty.name = 'nvarchar' AND c.max_length = -1
       ORDER BY t.name, c.name`);
    console.log(
      maxCols.recordset.length === 0
        ? `\nNVARCHAR(MAX) target columns: none (all ${TARGET_COLUMNS.length} narrowed)`
        : `\nNVARCHAR(MAX) target columns: ${maxCols.recordset.length} of ${TARGET_COLUMNS.length} remaining`,
    );

    const log = await pool.request().query(`
      SELECT CAST(SUM(CASE WHEN type = 2 THEN size END) * 8.0 / 1024 AS DECIMAL(10,1)) AS used_log_mb,
             CAST(SUM(CASE WHEN type = 0 THEN size END) * 8.0 / 1024 AS DECIMAL(10,1)) AS free_log_mb
        FROM sys.database_files`);
    console.log(
      `Transaction log: ${log.recordset[0].used_log_mb ?? 0} MB used, ${log.recordset[0].free_log_mb ?? 0} MB free`,
    );
  } finally {
    await pool.close();
  }
}

/**
 * `--dry-run`: print the exact statements `--apply` would execute, without
 * executing them. Complements `--preflight`, which validates value lengths but
 * shows no SQL: this answers "what will actually change on this database right
 * now", which on a second run is legitimately almost nothing.
 */
async function dryRun() {
  const pool = await new sql.ConnectionPool(config()).connect();
  try {
    const live = await pool.request().query(`
      SELECT t.name AS tbl, c.name AS col, c.is_nullable AS nullable
        FROM sys.tables t
        JOIN sys.columns c ON c.object_id = t.object_id
        JOIN sys.types ty ON ty.user_type_id = c.user_type_id
       WHERE ty.name = 'nvarchar' AND c.max_length = -1`);

    const stillMax = new Set(live.recordset.map((r) => `${r.tbl}.${r.col}`));
    const nullableOf = new Map(
      live.recordset.map((r) => [`${r.tbl}.${r.col}`, Boolean(r.nullable)]),
    );
    // Sizes come from the migration itself so this cannot drift from it. The
    // CTE's first row carries `AS tbl, AS col` aliases and later rows do not,
    // so each identifier is matched with any trailing alias text.
    const ddl = read(FORWARD);
    const sizes = new Map();
    for (const m of ddl.matchAll(
      /SELECT '([a-z_]+)'[^,]*,\s*'([A-Za-z_]+)'[^,]*,\s*(\d+)/g,
    )) {
      sizes.set(`${m[1]}.${m[2]}`, Number(m[3]));
    }

    const alters = TARGET_COLUMNS.filter(([tbl, col]) =>
      stillMax.has(`${tbl}.${col}`),
    );

    console.log("--- ALTER COLUMN statements that would run");
    if (!alters.length) {
      console.log("    none (every target column is already sized)");
    }
    for (const [tbl, col] of alters) {
      const size = sizes.get(`${tbl}.${col}`);
      const nullability = nullableOf.get(`${tbl}.${col}`) ? "NULL" : "NOT NULL";
      console.log(
        `    ALTER TABLE [${tbl}] ALTER COLUMN [${col}] NVARCHAR(${size}) ${nullability};`,
      );
    }

    const existing = await pool.request().query(
      `SELECT i.name FROM sys.indexes i WHERE i.name IS NOT NULL`,
    );
    const have = new Set(existing.recordset.map((r) => r.name));

    console.log("\n--- CREATE INDEX statements that would run");
    const missing = INDEXES.filter(([, name]) => !have.has(name));
    if (!missing.length) console.log("    none (all four indexes exist)");
    for (const [table, name] of missing) {
      console.log(`    CREATE NONCLUSTERED INDEX ${name} ON ${table} …`);
    }

    console.log(
      `\nSummary: ${alters.length} column(s) to narrow, ${missing.length} index(es) to create.`,
    );
    console.log(
      "No DDL was executed. Run --apply to perform it (heaps are rewritten).",
    );
  } finally {
    await pool.close();
  }
}

async function main() {
  if (!process.env.SQL_SERVERIP) {
    throw new Error(
      "SQL_SERVERIP is not set — load .env first: set -a; . ./.env; set +a",
    );
  }
  const forward = read(FORWARD);

  if (has("--dry-run")) {
    await dryRun();
    return;
  }

  if (has("--preflight")) {
    console.log("Preflight only (no DDL).\n");
    await execute("preflight", section(forward, "preflight"));
    return;
  }

  if (has("--apply")) {
    console.log("Preflight, then DDL. This rewrites the heap: expect minutes.\n");
    await execute("apply", forward);
    console.log("");
    await report();
    return;
  }

  if (has("--rollback")) {
    console.log("Rolling back.\n");
    await execute("rollback", read(ROLLBACK));
    console.log("");
    await report();
    return;
  }

  if (has("--status")) return report();

  console.log(
    [
      "Usage: node scripts/apply-ramp-daily-perf.mjs <flag>",
      "",
      "  --preflight   read-only length/index guards (safe, fast enough to always run)",
      "  --dry-run     print the exact ALTER/CREATE statements --apply would run, without running them",
      "  --apply       narrow columns and create the covering indexes",
      "  --rollback    drop the indexes and restore NVARCHAR(MAX)",
      "  --status      list applied indexes, remaining MAX columns, log usage",
      "",
      "RAMP_Daily is in FULL recovery — check --status for log space before --apply.",
    ].join("\n"),
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
