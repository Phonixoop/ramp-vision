import sql from "mssql";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

/** RAMP_OTP connection config. Reuses mssql default pool after first connect. */
const config: sql.config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVERIP,
  port: parseInt(process.env.SQL_PORT ?? "1433", 10),
  database: "RAMP_OTP",
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};
await sql.connect(config);

export type RasaOtpRow = { Otp: string; UpdatedAt: string | null };

export const otpUserRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async (): Promise<RasaOtpRow[]> => {
    const request = new sql.Request();
    request.input("requestId", sql.VarChar(50), "gui-manual-report");
    const result = await request.query<RasaOtpRow>(
      `SELECT Otp, UpdatedAt FROM RAMP_OTP.dbo.RasaOtpRequest WHERE RequestId = @requestId ORDER BY UpdatedAt DESC`
    );
    return result?.recordset ?? [];
  }),
});
