const sql = require("mssql");
const cfg = { user: process.env.SQL_USER, password: process.env.SQL_PASSWORD, server: process.env.SQL_SERVERIP, port: Number(process.env.SQL_PORT||1433), database: "RAMP_Daily", options:{encrypt:true,trustServerCertificate:true,serverName:"localhost"}, connectionTimeout:8000, requestTimeout:600000 };
(async () => {
  const pool = await new sql.ConnectionPool(cfg).connect();
  const q = async (label, text) => {
    const t = Date.now();
    try { const r = await pool.request().query(text);
      console.log("###", label, (Date.now()-t)+"ms");
      console.log(JSON.stringify(r.recordsets, null, 0).slice(0, 4000));
    } catch (e) { console.log("###", label, "ERR", e.message); }
  };
  await q("cols", `SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME IN ('personnel_performance','depos','users_info','users')
    ORDER BY TABLE_NAME, ORDINAL_POSITION`);
  await q("perms", `SELECT IS_MEMBER('db_owner') dbo, HAS_PERMS_BY_NAME('personnel_performance','OBJECT','ALTER') alterPP, HAS_PERMS_BY_NAME(DB_NAME(),'DATABASE','ALTER') alterDb`);
  await pool.close();
})().catch(e => { console.log("ERR", e.message); process.exit(1); });
