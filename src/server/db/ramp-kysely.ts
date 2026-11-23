/**
 * Kysely client for the legacy `RAMP_Daily` SQL Server database.
 *
 * Mounted on the same native `tedious` + `tarn` driver stack the rest of the app
 * already uses, so no extra Rust engine or generated client is involved. This is
 * deliberately separate from Prisma, which keeps serving `RAMP_Vision` only.
 *
 * Notes:
 * - Lazy: nothing connects until the first query, so `next build` never needs
 *   database access.
 * - `tedious`/`tarn` are already in `serverExternalPackages` in next.config.mjs.
 * - The pool is created once per Node process (dev HMR safe via globalThis).
 */
import { Kysely, MssqlDialect } from "kysely";
import * as Tarn from "tarn";
import * as Tedious from "tedious";

import type { RampDB } from "./ramp-schema";

function isIpLiteral(host: string): boolean {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host) || host.includes(":");
}

function poolSize(): number {
  const parsed = Number(process.env.SQL_POOL_MAX ?? 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
}

function createDialect(): MssqlDialect {
  const server = process.env.SQL_SERVERIP ?? "";
  const port = Number(process.env.SQL_PORT ?? 1433);
  const user = process.env.SQL_USER;
  const password = process.env.SQL_PASSWORD;

  return new MssqlDialect({
    tarn: {
      ...Tarn,
      options: {
        min: 0,
        max: poolSize(),
        // Aggregates over a month of 1.6M rows can take a while cold.
        acquireTimeoutMillis: 30_000,
        idleTimeoutMillis: 60_000,
      },
    },
    tedious: {
      ...Tedious,
      connectionFactory: () =>
        new Tedious.Connection({
          server,
          authentication: {
            type: "default",
            options: { userName: user, password },
          },
          options: {
            port: Number.isNaN(port) ? 1433 : port,
            database: "RAMP_Daily",
            encrypt: true,
            trustServerCertificate: true,
            // Node forbids IP literals as TLS SNI; keep the same workaround as
            // mssql-pool.ts so both clients behave identically.
            ...(isIpLiteral(server) ? { serverName: "localhost" } : {}),
            // Server-side long aggregate; client must not give up first.
            requestTimeout: 120_000,
            rowCollectionOnRequestCompletion: true,
          },
        }),
    },
  });
}

declare global {
  // eslint-disable-next-line no-var
  var __rampKysely: Kysely<RampDB> | undefined;
}

function createClient(): Kysely<RampDB> {
  return new Kysely<RampDB>({
    dialect: createDialect(),
    // Kysely logs every query at debug; opt in only when asked.
    log: process.env.RAMP_KYSELY_LOG === "1" ? ["query", "error"] : ["error"],
  });
}

/** Singleton Kysely client for `RAMP_Daily`. */
export function getRampDb(): Kysely<RampDB> {
  if (!globalThis.__rampKysely) {
    globalThis.__rampKysely = createClient();
  }
  return globalThis.__rampKysely;
}
