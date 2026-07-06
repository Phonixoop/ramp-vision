import sql from "mssql";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getMssqlPool } from "~/server/db/mssql-pool";

export type RasaOtpRow = { Otp: string; UpdatedAt: string | null };

export const otpUserRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async (): Promise<RasaOtpRow[]> => {
    const request = (await getMssqlPool()).request();
    request.input("requestId", sql.VarChar(50), "gui-manual-report");
    const result = await request.query<RasaOtpRow>(
      `SELECT Otp, UpdatedAt FROM RAMP_OTP.dbo.RasaOtpRequest WHERE RequestId = @requestId ORDER BY UpdatedAt DESC`
    );
    return result?.recordset ?? [];
  }),
});
