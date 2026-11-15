import sql from "mssql";

let pool: sql.ConnectionPool | null = null;
let poolPromise: Promise<sql.ConnectionPool> | null = null;

function isIpLiteral(host: string): boolean {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host) || host.includes(":");
}

function getMssqlConfig(): sql.config {
  const port = parseInt(process.env.SQL_PORT ?? "1433", 10);
  const server = process.env.SQL_SERVERIP ?? "";

  return {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    server,
    port: Number.isNaN(port) ? 1433 : port,
    database: "",
    options: {
      encrypt: true,
      trustServerCertificate: true,
      // Node forbids IP literals as TLS SNI; use a placeholder hostname when
      // connecting by IP (safe with trustServerCertificate: true).
      ...(isIpLiteral(server) ? { serverName: "localhost" } : {}),
    },
  };
}

/** Lazy SQL pool — connects on first query, not at module import (avoids build-time DB requirement). */
export async function getMssqlPool(): Promise<sql.ConnectionPool> {
  if (pool?.connected) return pool;

  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(getMssqlConfig())
      .connect()
      .then((connectedPool) => {
        pool = connectedPool;
        return connectedPool;
      })
      .catch((error) => {
        poolPromise = null;
        pool = null;
        throw error;
      });
  }

  return poolPromise;
}

export async function mssqlQuery<T = unknown>(
  query: string,
): Promise<sql.IResult<T>> {
  return (await getMssqlPool()).query<T>(query);
}
