const sql = require("mssql");
const cfg = { user: process.env.SQL_USER, password: process.env.SQL_PASSWORD, server: process.env.SQL_SERVERIP, port: Number(process.env.SQL_PORT||1433), database: "RAMP_Daily", options:{encrypt:true,trustServerCertificate:true,serverName:"localhost"}, connectionTimeout:8000, requestTimeout:600000 };
(async () => {
  const pool = await new sql.ConnectionPool(cfg).connect();
  const q = async (label, text) => {
    const t = Date.now();
    try { const r = await pool.request().query(text);
      console.log("###", label, (Date.now()-t)+"ms");
      console.log(JSON.stringify(r.recordsets).slice(0, 3000));
    } catch (e) { console.log("###", label, "ERR", e.message); }
  };
  await q("pp-cols", `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='personnel_performance' ORDER BY ORDINAL_POSITION`);
  await q("ui-cols", `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='users_info' ORDER BY ORDINAL_POSITION`);
  await q("u-cols", `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='users' ORDER BY ORDINAL_POSITION`);
  await pool.close();
})().catch(e => { console.log("ERR", e.message); process.exit(1); });
