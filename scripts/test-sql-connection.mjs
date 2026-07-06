/**
 * Test SQL connectivity from the app server.
 * Usage: node scripts/test-sql-connection.mjs
 * Loads .env from project root if dotenv is available via npm.
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import sql from "mssql";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env");

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

const server = process.env.SQL_SERVERIP;
const port = parseInt(process.env.SQL_PORT ?? "1433", 10);
const user = process.env.SQL_USER;
const password = process.env.SQL_PASSWORD;

console.log(`Testing SQL Server at ${server}:${port} as user ${user}...`);

try {
  const pool = await new sql.ConnectionPool({
    user,
    password,
    server,
    port,
    database: "",
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
  }).connect();

  const result = await pool.request().query("SELECT 1 AS ok");
  console.log("SUCCESS:", result.recordset);
  await pool.close();
  process.exit(0);
} catch (error) {
  console.error("FAILED:", error.message);
  process.exit(1);
}
