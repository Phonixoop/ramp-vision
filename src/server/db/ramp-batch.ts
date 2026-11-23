/**
 * Multi-statement batch helpers for the `RAMP_Daily` Kysely client.
 *
 * Kysely's MSSQL driver streams **every** result set of a batch into one flat
 * `rows` array — the recordset boundaries are not preserved. Relying on
 * `result.rows[0]` / positional destructuring therefore silently returns the
 * wrong slice the moment a statement yields more (or fewer) than one row.
 *
 * The fix is to make the discriminator part of the payload: every statement in a
 * batch emits a constant `__set` tag, and the caller partitions on it. That
 * keeps a single round trip (the whole point) while staying immune to row-count
 * changes.
 */
import { sql, type RawBuilder } from "kysely";

import { getRampDb } from "./ramp-kysely";

/** Per-statement discriminator column, echoed back by every statement. */
export const BATCH_TAG_COLUMN = "__set";

/**
 * Execute one compiled batch and return the flattened rows.
 *
 * Cancellation is handled where it is actually effective: `tedious` aborts the
 * server-side request when the HTTP client disconnects (the route's
 * `request.signal` tears the stream down, which closes the connection). Kysely
 * v0.28's `executeQuery` takes a `QueryId`, not an `AbortSignal`.
 */
export async function executeBatch<T>(query: RawBuilder<unknown>): Promise<T[]> {
  const db = getRampDb();
  const compiled = query.compile(db);
  const result = await db.executeQuery<T>({
    sql: compiled.sql,
    parameters: compiled.parameters,
    query: compiled.query,
  } as never);
  return result.rows;
}

/**
 * Partition flattened batch rows by their `__set` tag.
 *
 * Rows missing a tag (or carrying an unexpected one) are ignored rather than
 * misfiled, so a future statement added to the batch cannot corrupt the slices
 * of the statements that were already there.
 */
export function splitByTag<T extends Record<string, unknown>>(
  rows: T[],
): Record<string, Omit<T, typeof BATCH_TAG_COLUMN>[]> {
  const out: Record<string, Omit<T, typeof BATCH_TAG_COLUMN>[]> = {};
  for (const row of rows) {
    const tag = row[BATCH_TAG_COLUMN];
    if (typeof tag !== "string" || !tag) continue;
    const { [BATCH_TAG_COLUMN]: _tag, ...rest } = row;
    (out[tag] ??= []).push(rest as Omit<T, typeof BATCH_TAG_COLUMN>);
  }
  return out;
}

/** `'tag' AS __set` — the discriminator every statement in a batch must emit. */
export function batchTag(tag: string): RawBuilder<unknown> {
  return sql`${tag} AS ${sql.ref(BATCH_TAG_COLUMN)}`;
}
