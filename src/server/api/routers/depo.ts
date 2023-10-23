import { z } from "zod";

import sql from "mssql";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import moment from "jalali-moment";
import {
  calculateDepoCompleteTime,
  extractYearAndMonth,
  getDatesForLastMonth,
  getFirstSaturdayOfLastWeekOfMonth,
  getWeekOfMonth,
} from "~/utils/util";

import { generateWhereClause, getPermission } from "~/server/server-utils";
import { TremorColor } from "~/types";

const config = {
  user: "admin",
  password: "Mohammad@2525",
  server: "109.125.137.43",
  port: 5090,
  database: "", // RAMP_Daily | RAMP_Weekly
  options: {
    encrypt: true, // For securing the connection (optional, based on your setup)
    trustServerCertificate: true, // For self-signed certificates (optional, based on your setup)
  },
};
await sql.connect(config);
export const depoRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        // limit: z.number().min(1).max(100).nullish().default(10),
        // cursor: z.string().nullish(),
        periodType: z
          .string(z.enum(["روزانه", "هفتگی", "ماهانه"]))
          .default("روزانه"),
        filter: z.object({
          ServiceName: z.array(z.string()).nullish(),
          CityName: z.array(z.string()).nullish(),
          DocumentType: z.array(z.string()).nullish(),
          Start_Date: z.array(z.string()).min(1).max(10),
        }),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        // Connect to SQL Server

        let finalResult = [];
        const permissions = await getPermission({ ctx });
        const cities = permissions
          .find((permission) => permission.id === "ViewCities")
          .subPermissions.filter((permission) => permission.isActive)
          .map((permission) => permission.enLabel);

        let filter = input.filter;

        filter.CityName = cities;

        let queryStart = `SELECT DISTINCT 
           ServiceName
          ,CityName
          ,DocumentType
          ,SUM(depos.EntryCount) AS EntryCount
          ,SUM(depos.Capicity) AS Capicity,
           SUM(depos.DepoCount) AS DepoCount,Start_Date FROM `;
        let dbName = "";
        let whereClause = "";

        if (input.periodType === "روزانه") {
          dbName = "RAMP_Daily.dbo.depos";
          whereClause = generateWhereClause(filter);
          whereClause += ` Group By ServiceName,CityName,DocumentType,Start_Date`;
        } else if (input.periodType === "هفتگی") {
          dbName = "RAMP_Weekly.dbo.depos";
          filter.Start_Date = [filter.Start_Date[0]];

          whereClause = generateWhereClause(filter);
          whereClause += ` Group By ServiceName,CityName,DocumentType,Start_Date`;
        } else if (input.periodType === "ماهانه") {
          dbName = "RAMP_Weekly.dbo.depos";

          filter.Start_Date = filter.Start_Date.map((d) => {
            return extractYearAndMonth(d);
          });

          whereClause = generateWhereClause(
            filter,
            "Start_Date",
            "SUBSTRING(Start_Date, 1, 7)",
          );
          whereClause += ` group by ServiceName,DocumentType,CityName`;
          const date = filter.Start_Date[0].split("/");
          const lastWeek = getFirstSaturdayOfLastWeekOfMonth(
            parseInt(date[0]),
            parseInt(date[1]),
          );

          // console.log(date, lastWeek);
          // const monthName = moment()
          //   .locale("fa")
          //   .month(parseInt(date[1]) - 1)
          //   .format("MMMM");
          queryStart = `
          SELECT distinct depos.ServiceName,depos.CityName,depos.DocumentType,SUM(depos.EntryCount) AS EntryCount ,SUM(depos.Capicity) AS Capicity,
          SUM(CASE WHEN Start_Date = '${lastWeek}' THEN DepoCount ELSE 0 END) AS DepoCount

          FROM
          `;
        }

        let query = `
        ${queryStart}
        ${dbName} 
        ${whereClause}
        `;
        console.log(query);
        const result = await sql.query(query);

        if (input.periodType === "روزانه") {
          finalResult = result.recordsets[0];
        }
        if (input.periodType === "هفتگی") {
          const date = filter.Start_Date[0].split("/");

          const monthName = moment()
            .locale("fa")
            .month(parseInt(date[1]) - 1)
            .format("MMMM");

          const weekNumber = getWeekOfMonth(filter.Start_Date[0]);
          const weekName = `هفته ${weekNumber} ${monthName}`;

          finalResult = result.recordsets[0].map((record) => {
            return {
              ...record,
              Start_Date: weekName,
            };
          });
        }

        if (input.periodType === "ماهانه") {
          const date = filter.Start_Date[0].split("/");

          const monthName = moment()
            .locale("fa")
            .month(parseInt(date[1]) - 1)
            .format("MMMM");

          finalResult = result.recordsets[0].map((record) => {
            return {
              ...record,
              Start_Date: monthName,
            };
          });
        }

        return {
          periodType: input.periodType,
          result: finalResult ?? [],
        };
        // Respond with the fetched data
      } catch (error) {
        console.error("Error fetching data:", error.message);
        return error;
      }
    }),
  getInitialFilters: protectedProcedure.query(async ({ ctx, input }) => {
    try {
      // Connect to SQL Server

      const permissions = await getPermission({ ctx });
      const cities = permissions
        .find((permission) => permission.id === "ViewCities")
        .subPermissions.filter((permission) => permission.isActive)
        .map((permission) => permission.enLabel);

      const whereClause = generateWhereClause({ CityName: cities });
      const queryCities = `SELECT DISTINCT CityName FROM RAMP_Daily.dbo.depos ${whereClause} ORDER BY CityName ASC
      `;

      const resultOfCities = await sql.query(queryCities);

      // const queryDocumentTypes = `SELECT DISTINCT DocumentType FROM RAMP_Daily.dbo.depos`;
      // console.log(queryDocumentTypes);
      // const resultOfDocumentTypes = await sql.query(queryDocumentTypes);

      const result = {
        Cities: resultOfCities.recordsets[0].filter((c) => c.CityName !== ""),
      };

      return result;
      // Respond with the fetched data
    } catch (error) {
      console.error("Error fetching data:", error.message);
      return error;
    }
  }),
  get30DaysTrack: protectedProcedure
    .input(
      z.object({
        filter: z.object({
          CityName: z.array(z.string()).nullish(),
        }),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        // Connect to SQL Server

        const permissions = await getPermission({ ctx });
        const cities = permissions
          .find((permission) => permission.id === "ViewCities")
          .subPermissions.filter((permission) => permission.isActive)
          .map((permission) => permission.enLabel);

        const days = getDatesForLastMonth();
        const whereClause = generateWhereClause({
          CityName: cities,
          Start_Date: days,
        });
        const queryDaysOfMonth = `SELECT 
        Start_Date, 
        SUM(DepoCount) AS DepoCount, 
        SUM(EntryCount) AS EntryCount, 
        SUM(Capicity) AS Capicity FROM RAMP_Daily.dbo.depos 
        ${whereClause}
        GROUP BY Start_Date ORDER BY Start_Date
        `;
        // console.log(queryDaysOfMonth);
        const resultDays = await sql.query(queryDaysOfMonth);

        // const queryDocumentTypes = `SELECT DISTINCT DocumentType FROM RAMP_Daily.dbo.depos`;
        // console.log(queryDocumentTypes);
        // const resultOfDocumentTypes = await sql.query(queryDocumentTypes);

        const result: {
          date: string;
          performance: number;
          tracker: {
            color: TremorColor;
            tooltip: string;
          }[];
        } = {
          date: moment().locale("fa").subtract(1, "months").format("MMMM"),
          tracker: [],
          performance: 0,
        };
        days.forEach((day) => {
          result.tracker.push({
            color: "stone",
            tooltip: day + " | بدون دیتا",
          });
        });
        let performance = 0;
        resultDays.recordsets[0].map((d) => {
          const depoCompleteTime = calculateDepoCompleteTime(d);
          const track = result.tracker.find(
            (a) => a.tooltip.split("|")[0].trim() === d.Start_Date,
          );

          if (depoCompleteTime <= 0) {
            track.color = "rose";
          } else if (depoCompleteTime == 0) {
            track.color = "slate";
          } else {
            performance += 1;
            track.color = "emerald";
          }

          track.tooltip = d.Start_Date;
        });

        // const percentage = (result.performance / 31) * 100;
        //  result.performance = Math.round(percentage / 10) * 10;
        result.performance = Math.floor(
          (performance / result.tracker.length) * 100,
        );
        return result;
        // Respond with the fetched data
      } catch (error) {
        console.error("Error fetching data:", error.message);
        return error;
      }
    }),
});

function generateFilterOnlySelect(filter: string[]) {
  const columns = [];
  filter.map((column) => {
    columns.push(column);
  });

  return columns.length > 0 ? `${columns.join(",")}` : "";
}

// function getWeekOfMonth(input) {
//   input = moment(input, "YYYY/MM/DD").locale("fa");
//   const dayOfInput = input.clone().day(); // Saunday is 0 and Saturday is 6
//   if (dayOfInput != 6) return input.clone().day();
//   const diffToNextWeek = 7 - dayOfInput;
//   const nextWeekStartDate = input.date() + diffToNextWeek;
//   const weekNumber = Math.ceil(nextWeekStartDate / 7);
//   return weekNumberText[weekNumber];
// }
