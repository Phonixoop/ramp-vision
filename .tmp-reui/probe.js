const sql = require("mssql");
(async () => {
  const pool = await new sql.ConnectionPool({
    user: process.env.SQL_USER, password: process.env.SQL_PASSWORD,
    server: process.env.SQL_SERVERIP, port: Number(process.env.SQL_PORT||1433),
    database: "RAMP_Daily",
    options: { encrypt: true, trustServerCertificate: true, serverName: "localhost" },
    connectionTimeout: 8000, requestTimeout: 15000,
  }).connect();
  const r = await pool.request().query(`
    SELECT t.name AS tbl, SUM(p.rows) AS rows FROM sys.tables t
    JOIN sys.partitions p ON p.object_id=t.object_id AND p.index_id IN (0,1)
    WHERE t.name IN ('personnel_performance','depos','users_info','users')
    GROUP BY t.name;
    SELECT TOP 40 i.name AS idx, t.name AS tbl, i.type_desc, c.name AS col, ic.key_ordinal, ic.is_included_column
    FROM sys.indexes i
    JOIN sys.tables t ON t.object_id=i.object_id
    JOIN sys.index_columns ic ON ic.object_id=i.object_id AND ic.index_id=i.index_id
    JOIN sys.columns c ON c.object_id=i.object_id AND c.column_id=ic.column_id
    WHERE t.name IN ('personnel_performance','depos','users_info','users') AND i.type>0
    ORDER BY t.name, i.name, ic.key_ordinal;
  `);
  console.log(JSON.stringify(r.recordsets, null, 1).slice(0, 4000));
  await pool.close();
})().catch(e => { console.log("ERR", e.message); process.exit(1); });
