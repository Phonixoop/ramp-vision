import { z } from "zod";

import sql from "mssql";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import moment from "jalali-moment";
import {
  calculateDepoCompleteTime,
  extractYearAndMonth,
  getDatesForLastMonth,
  getFirstSaturdayOfLastWeekOfMonth,
} from "~/utils/util";

const config = {
  user: "admin",
  password: "Mohammad@2525",
  server: "109.125.137.43",
  port: 5090,
  database: "RAMP_Daily",
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
        let filter = input.filter;

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
          console.log(date, lastWeek);
          const monthName = moment()
            .locale("fa")
            .month(parseInt(date[1]) - 1)
            .format("MMMM");
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

        return result.recordsets[0];
        // Respond with the fetched data
      } catch (error) {
        console.error("Error fetching data:", error.message);
        return error;
      }
    }),
  getInitialFilters: protectedProcedure.query(async ({ ctx, input }) => {
    try {
      // Connect to SQL Server

      const queryCities = `SELECT DISTINCT CityName FROM RAMP_Daily.dbo.users WHERE CityName is not NULL
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
        const days = getDatesForLastMonth();
        const whereClause = generateWhereClause({
          CityName: input.filter.CityName,
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

        const result = {
          date: moment().locale("fa").subtract(1, "months").format("MMMM"),
          tracker: [],
          performance: 0,
        };
        let performance = 0;
        resultDays.recordsets[0].map((d) => {
          const DepoCompleteTime = calculateDepoCompleteTime(d);

          if (DepoCompleteTime <= 0)
            result.tracker.push({
              color: "rose",
              tooltip: d.Start_Date,
            });
          else if (DepoCompleteTime == 0) {
            result.tracker.push({
              color: "gray",
              tooltip: d.Start_Date,
            });
          } else {
            performance += 1;
            result.tracker.push({
              color: "emerald",
              tooltip: d.Start_Date,
            });
          }
        });
        // const percentage = (result.performance / 31) * 100;
        //  result.performance = Math.round(percentage / 10) * 10;
        result.performance = Math.floor((performance / 31) * 100);
        return result;
        // Respond with the fetched data
      } catch (error) {
        console.error("Error fetching data:", error.message);
        return error;
      }
    }),
});

function generateWhereClause(
  filter,
  ignoreKey = undefined,
  customFun = undefined,
) {
  const conditions = [];

  for (const key in filter) {
    const value = filter[key];
    if (Array.isArray(value)) {
      // If the value is an array, create a condition with IN operator
      const newValue = [];
      value.forEach((v) => {
        newValue.push(`N'${v}'`);
      });

      const cw = ignoreKey === key && customFun ? customFun : key;
      const condition = `${cw} IN (${newValue.join(",")})`;
      if (value.length > 0) conditions.push(condition);
    } else if (value !== undefined && value !== null) {
      const condition = `${key} = '${value}'`;
      conditions.push(condition);
    }
  }
  return conditions.length > 0
    ? `WHERE CityName is not NULL AND ${conditions.join(" AND ")}`
    : "";
}

function generateFilterOnlySelect(filter: string[]) {
  const columns = [];
  filter.map((column) => {
    columns.push(column);
  });

  return columns.length > 0 ? `${columns.join(",")}` : "";
}
