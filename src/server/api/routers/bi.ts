import { generateWhereClause, getPermission } from "~/server/server-utils";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { mssqlQuery } from "~/server/db/mssql-pool";
import {
  extractYearAndMonth,
  getDatesBetweenTwoDates,
} from "~/utils/date-utils";

export const biRouter = createTRPCRouter({
  getReports: protectedProcedure
    .input(
      z.object({
        periodType: z.enum(["هفتگی", "ماهانه", "روزانه"]).default("ماهانه"),
        filter: z.object({
          DateFa: z.array(z.string()).min(1).max(10),
        }),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        let finalResult = [];
        // const permissions = await getPermission({ ctx });

        let filter = input.filter;

        let queryStart = `
          SELECT DISTINCT CityName, DateFa, DateEn, CommitmentFivePercentage, CommitmentTenPercentage, 
          AverageRemittaceConfirmation, DocumentBillCountDirect, DocumentHandlingRatioDirect, ReturnRatioDirect, 
          DocumentAcceptanceCountInDirect, DocumentHandlingRatioInDirect, LastUpdateTime
          FROM Ramp_Bi.dbo.AssessmentDatas
        `;
        let whereClause = "";

        if (input.periodType === "روزانه") {
          let dates = filter.DateFa.map((d) => {
            const _d = d.split("/");

            return `LIKE '${_d[0]}/${_d[1]}/${_d[2]}'`;
          });
          const likeConditions = dates
            .map((date) => `DateFa  ${date} `)
            .join(" OR ");
          whereClause = likeConditions;
        } else if (input.periodType === "هفتگی") {
          filter.DateFa = getDatesBetweenTwoDates(
            filter.DateFa[0],
            filter.DateFa[1],
          );
          let dates = filter.DateFa.map((d) => {
            const _d = d.split("/");

            return `LIKE '${_d[0]}/${_d[1]}/${_d[2]}'`;
          });
          const likeConditions = dates
            .map((date) => `DateFa  ${date} `)
            .join(" OR ");
          whereClause = likeConditions;
        } else if (input.periodType === "ماهانه") {
          filter.DateFa = filter.DateFa.map((d) => extractYearAndMonth(d));
          let dates = filter.DateFa.map((d) => {
            const _d = d.split("/");

            return `LIKE '${_d[0]}/${_d[1]}/%'`;
          });
          const likeConditions = dates
            .map((date) => `DateFa  ${date} `)
            .join(" OR ");

          whereClause = likeConditions;
        }

        let query = `${queryStart} Where ${whereClause} ORDER BY CityName, DateFa`;
        // console.log(query);
        const result = await mssqlQuery(query);
        finalResult = result.recordsets[0] ?? [];

        return { periodType: input.periodType, result: finalResult };
      } catch (error) {
        console.error("Error fetching data:", error.message);
        return error;
      }
    }),
});
