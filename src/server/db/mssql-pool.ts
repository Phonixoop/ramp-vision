import sql from "mssql";

let pool: sql.ConnectionPool | null = null;
let poolPromise: Promise<sql.ConnectionPool> | null = null;

function getMssqlConfig(): sql.config {
  const port = parseInt(process.env.SQL_PORT ?? "1433", 10);

  return {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    server: process.env.SQL_SERVERIP,
    port: Number.isNaN(port) ? 1433 : port,
    database: "",
    options: {
      encrypt: true,
      trustServerCertificate: true,
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
