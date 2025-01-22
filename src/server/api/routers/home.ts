import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { dbRampDaily } from "~/server/server-utils/ramp-daily";

export const homeRouter = createTRPCRouter({
  getdaysCount: publicProcedure.query(async ({ input }) => {
    const query =
      "SELECT COUNT(DISTINCT Start_Date) as Count FROM RAMP_Daily.dbo.personnel_performance ";
    const result = await dbRampDaily.query(query);
    return result.recordset[0].Count;
  }),

  getAll: publicProcedure.query(({ ctx }) => {
    return [];
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
