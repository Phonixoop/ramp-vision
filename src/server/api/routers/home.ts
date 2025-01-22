import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import sql from "mssql";
const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVERIP,
  port: parseInt(process.env.SQL_PORT),
  database: "", // Set your database name, e.g., "RAMP_Daily" or "RAMP_Weekly"
  options: {
    encrypt: true, // For securing the connection (optional, based on your setup)
    trustServerCertificate: true, // For self-signed certificates (optional, based on your setup)
  },
};

await sql.connect(config);

export const homeRouter = createTRPCRouter({
  getdaysCount: publicProcedure.query(async ({ input }) => {
    const query =
      "SELECT COUNT(DISTINCT Start_Date) as Count FROM RAMP_Daily.dbo.personnel_performance ";
    const result = await sql.query(query);
    return result.recordset[0].Count;
  }),

  getAll: publicProcedure.query(({ ctx }) => {
    return [];
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
