# Personnel City Mismatch Fix

## Problem

Personnel could appear under a city in the performance dashboard (e.g. `/dashboard/personnel_performance/chart/Bushehr`) because their **performance records** (`personnel_performance.CityName`) were tagged with that city — often when they worked there temporarily.

Their **real/home city** comes from the `users` table (`users.CityName`), joined via `NationalCode`. When these two cities differed, city-level performance totals and averages were skewed.

### Example

| Source                                       | City    |
| -------------------------------------------- | ------- |
| Performance record (`personnel_performance`) | Bushehr |
| User profile (`users`)                       | Semnan  |

The person showed up on the Bushehr page and was counted toward Bushehr’s city performance, even though their main city is Semnan.

## Desired Behavior

| Area                                                       | Mismatched personnel                                       |
| ---------------------------------------------------------- | ---------------------------------------------------------- |
| City performance totals / charts / gauges                  | **Excluded** from aggregation                              |
| Personnel lists and tables                                 | **Included** — still visible                               |
| Name display                                               | Show real city in parentheses, e.g. `نام خانوادگی (سمنان)` |
| Individual person stats (click row, spark chart, calendar) | **Unchanged**                                              |

## Solution Overview

A **hybrid server + client** approach:

1. **Server SQL** — join `users`, return `RealCityName` on every row from `getAll`; exclude mismatches in `getCitiesWithPerformance` aggregation.
2. **Shared client utilities** — detect mismatch and format display names consistently.
3. **UI consumers** — show `(real city)` labels; exclude mismatched rows only from city-level averages on the client where needed.

```
personnel_performance.CityName  ──►  performance city (where work was recorded)
users.CityName                  ──►  RealCityName (person's home city)

Match:     included in city performance calculations
Mismatch:  excluded from city aggregates, shown as Name (Real City) in lists
```

---

## Files Changed

**Total: 14 files** across 4 layers.

| Layer                    | Count | Files                                 |
| ------------------------ | ----: | ------------------------------------- |
| Server (tRPC / SQL)      |     1 | `personnel_performance.ts` router     |
| Shared utilities         |     1 | `personnel-performance.ts`            |
| Type definitions         |     2 | table `types.ts`, pishkhan `types.ts` |
| React components & hooks |    10 | see below                             |

---

## 1. Server — `src/server/api/routers/personnel_performance.ts`

### New helpers

- `USERS_REAL_CITY_JOIN` — `JOIN RAMP_Daily.dbo.users as usr ON p.NationalCode = usr.NationalCode`
- `PERFORMANCE_CITY_MATCHES_USER` — `p.CityName = usr.CityName`
- `prefixPerformanceCityInWhere()` — qualifies `CityName` as `p.CityName` when `users` join would make the column ambiguous
- `mapPersonnelPerformanceRow()` — maps `CityName` and `RealCityName` to Persian for the API response

### `getAll` procedure

**What changed:**

- Added `users` table join on all period types (روزانه, هفتگی, ماهانه)
- `SELECT` now includes `usr.CityName as RealCityName`
- `GROUP BY` includes `usr.CityName`
- `WHERE` clauses use `p.CityName` instead of bare `CityName`
- Response maps both `CityName` and `RealCityName` to Persian

**What did _not_ change:**

- Rows are **not** filtered out — mismatched personnel still appear in list/detail queries.

### `getCitiesWithPerformance` procedure

**What changed:**

- Added `users` table join
- Added filter: `AND p.CityName = usr.CityName`
- Qualified columns: `p.CityName`, `p.Start_Date`, `p.HasTheDayOff`
- Applied `prefixPerformanceCityInWhere()` before query execution

**Effect:**

- City bar charts, city list on `/chart`, gauges dashboard, radar, and city overview charts all use corrected aggregates automatically (they already call this endpoint).

---

## 2. Shared utilities — `src/utils/personnel-performance.ts`

### New exports

| Function                                                   | Purpose                                                   |
| ---------------------------------------------------------- | --------------------------------------------------------- |
| `normalizeCityName()`                                      | Normalizes Persian/English city names for comparison      |
| `isPersonnelCityMismatch(performanceCity, realCity)`       | Returns `true` when cities differ                         |
| `getPersonnelDisplayName(name, performanceCity, realCity)` | Returns `Name (Real City)` when mismatched                |
| `filterRowsForCityPerformanceAggregate(rows)`              | Filters out mismatched rows for client-side city averages |

### Other change

- Added `"RealCityName"` to the default `values` array in `distinctPersonnelPerformanceData()` so the field survives aggregation when callers use defaults.

---

## 3. Type definitions (2 files)

| File                                                        | Change                                                                       |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `src/app/dashboard/personnel_performance/table/types.ts`    | Added optional `RealCityName?: string \| null` to `PersonnelPerformanceData` |
| `src/app/dashboard/personnel_performance/pishkhan/types.ts` | Added optional `RealCityName?: string \| null` to `PishkhanData`             |

---

## 4. React components & hooks (10 files)

### Chart — city detail page (5 files)

| File                                                | Change                                                                  |
| --------------------------------------------------- | ----------------------------------------------------------------------- |
| `chart/hooks/useCityPage.ts`                        | Pass `"RealCityName"` through `distinctPersonnelPerformanceData` values |
| `chart/[city]/components/PersonnelRow.tsx`          | Display name via `getPersonnelDisplayName()`                            |
| `chart/[city]/components/PersonnelRowOptimized.tsx` | Display name via `getPersonnelDisplayName()`                            |
| `chart/[city]/components/PersonnelDetails.tsx`      | Detail panel and modal title use `getPersonnelDisplayName()`            |

### Table page (3 files)

| File                                               | Change                                                                                                                        |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `table/components/PersonnelPerformanceTable.tsx`   | Pass `"RealCityName"` through `distinctPersonnelPerformanceData` values                                                       |
| `table/components/PersonnelPerformanceColumns.tsx` | Name column cell uses `getPersonnelDisplayName()`                                                                             |
| `table/components/PersonnelPerformanceSummary.tsx` | Gauge average uses `filterRowsForCityPerformanceAggregate()` — mismatched personnel excluded from city performance gauge only |

### Pishkhan page (2 files)

| File                                      | Change                                                                  |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| `pishkhan/components/PishkhanTable.tsx`   | Pass `"RealCityName"` through `distinctPersonnelPerformanceData` values |
| `pishkhan/components/PishkhanColumns.tsx` | Name column cell uses `getPersonnelDisplayName()`                       |

### Shared feature (1 file)

| File                                                                     | Change                                                                                                         |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `src/features/cities-performance-chart/cities-performance-bar-chart.tsx` | Bar chart personnel labels use `getPersonnelDisplayName()`; `"RealCityName"` passed through aggregation values |

---

## `getAll` consumers — coverage

Every `api.personnelPerformance.getAll.useQuery` call site was reviewed:

| Consumer                                                             | Updated?            | Notes                                                                                  |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------------------------------------------------------- |
| `chart/hooks/useCityPage.ts`                                         | Yes                 | Real city in list + details                                                            |
| `table/components/PersonnelPerformanceTable.tsx`                     | Yes                 | Table + summary gauge                                                                  |
| `pishkhan/components/PishkhanTable.tsx`                              | Yes                 | Table name column                                                                      |
| `features/cities-performance-chart/cities-performance-bar-chart.tsx` | Yes                 | Per-person bar labels                                                                  |
| `personnels/components/PersonnelsTable.tsx`                          | No UI change needed | Uses `getAll` for a single selected person’s calendar/spark data, not city aggregation |

City-level charts that use `getCitiesWithPerformance` (not `getAll`) were fixed entirely on the server and required no additional client filtering.

---

## Data flow after the fix

```
┌─────────────────────────────────────────────────────────────┐
│  getCitiesWithPerformance (SQL)                             │
│  WHERE p.CityName = usr.CityName                            │
│  → Chart city list, gauges, radar, city overview charts     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  getAll (SQL)                                               │
│  JOIN users → RealCityName on every row                     │
│  → All personnel rows returned (including mismatches)       │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  Client                                                     │
│  • Lists/tables: getPersonnelDisplayName()                  │
│  • Table summary gauge: filterRowsForCityPerformanceAggregate() │
└─────────────────────────────────────────────────────────────┘
```

---

## Testing checklist

- [ ] Open `/dashboard/personnel_performance/chart/{City}` — mismatched person appears with `(real city)` next to name
- [ ] City performance % on chart index does **not** include mismatched personnel
- [ ] Click mismatched person — individual stats and spark chart still work
- [ ] Table page (`/table`) — name column shows `(real city)`; summary gauge excludes mismatches
- [ ] Pishkhan page — name column shows `(real city)` when applicable
- [ ] Gauges dashboard — city totals unchanged logic-wise (uses `getCitiesWithPerformance`)
- [ ] Person with matching performance city and real city — no parentheses, included in all calculations

---

## Related tables

| Table                                  | Role                                                            |
| -------------------------------------- | --------------------------------------------------------------- |
| `RAMP_Daily.dbo.personnel_performance` | Daily performance records; `CityName` = where work was recorded |
| `RAMP_Daily.dbo.users_info`            | Role/project metadata (existing join)                           |
| `RAMP_Daily.dbo.users`                 | User profile; `CityName` = person’s real/home city              |

---

_Document generated for the personnel city mismatch fix. Last updated: June 2025._
