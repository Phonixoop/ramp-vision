const sql = require("mssql");
const cfg = { user: process.env.SQL_USER, password: process.env.SQL_PASSWORD, server: process.env.SQL_SERVERIP, port: Number(process.env.SQL_PORT||1433), database: "RAMP_Daily", options:{encrypt:true,trustServerCertificate:true,serverName:"localhost"}, connectionTimeout:8000, requestTimeout:120000 };
(async () => {
  const pool = await new sql.ConnectionPool(cfg).connect();
  const q = async (label, text) => {
    const t = Date.now();
    const r = await pool.request().query(text);
    console.log(label, (Date.now()-t)+"ms", "rows:"+ (r.recordset?.length ?? r.recordsets?.length));
    return r;
  };
  await q("cities", "SELECT COUNT(DISTINCT CityName) c, MIN(Start_Date) mn, MAX(Start_Date) mx FROM personnel_performance");
  await q("months", "SELECT TOP 5 SUBSTRING(Start_Date,1,7) m, COUNT(*) n FROM personnel_performance GROUP BY SUBSTRING(Start_Date,1,7) ORDER BY m DESC");
  const r1 = await q("monthly-agg-1city", `
    SELECT p.CityName, usr.NameFamily, u.NationalCode, p.Start_Date, SUM(p.TotalPerformance) t
    FROM personnel_performance p
    JOIN users_info u ON p.NationalCode = u.NationalCode
    CROSS APPLY (SELECT TOP 1 usr2.CityName, usr2.NameFamily FROM users AS usr2 WHERE usr2.NationalCode = p.NationalCode) usr
    WHERE p.Start_Date LIKE '1404/08/%' AND p.CityName = 'Tehran'
    GROUP BY p.CityName, usr.NameFamily, u.NationalCode, p.Start_Date
    ORDER BY p.CityName, usr.NameFamily`);
  const r2 = await q("monthly-agg-allcities", `
    SELECT p.CityName, usr.NameFamily, u.NationalCode, p.Start_Date, SUM(p.TotalPerformance) t
    FROM personnel_performance p
    JOIN users_info u ON p.NationalCode = u.NationalCode
    CROSS APPLY (SELECT TOP 1 usr2.CityName, usr2.NameFamily FROM users AS usr2 WHERE usr2.NationalCode = p.NationalCode) usr
    WHERE p.Start_Date LIKE '1404/08/%'
    GROUP BY p.CityName, usr.NameFamily, u.NationalCode, p.Start_Date
    ORDER BY p.CityName, usr.NameFamily`);
  await pool.close();
})().catch(e => { console.log("ERR", e.message); process.exit(1); });
