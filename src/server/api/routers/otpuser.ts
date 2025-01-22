import { z } from "zod";
import sql from "mssql";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVERIP,
  port: parseInt(process.env.SQL_PORT),
  database: "RAMP_OTP", // Set your database name, e.g., "RAMP_Daily" or "RAMP_Weekly"
  options: {
    encrypt: true, // For securing the connection (optional, based on your setup)
    trustServerCertificate: true, // For self-signed certificates (optional, based on your setup)
  },
};
await sql.connect(config);
export const otpUserRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const query = `
    
    use RAMP_OTP

     SELECT * FROM otpusers
    `;

    const result = await sql.query(query);
    console.log(JSON.stringify(result, null, 2));
    return result?.recordset ?? [];
  }),
});
