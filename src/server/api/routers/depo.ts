import { z } from "zod";
import sql from "mssql";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import moment from "jalali-moment";
import { getEnglishToPersianCity } from "~/utils/util";

import { generateWhereClause, getPermission } from "~/server/server-utils";
import { TremorColor } from "~/types";

import { ServiceNames } from "~/constants/depo";
import {
  calculateDepoCompleteTime,
  extractYearAndMonth,
  getDatesBetweenTwoDates,
  getDatesForLastMonth,
  getSecondOrLaterDayOfNextMonth,
  getWeekOfMonth,
} from "~/utils/date-utils";
const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVERIP,
  port: parseInt(process.env.SQL_PORT),
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

        // Parse the input date

        let finalResult = [];
        const permissions = await getPermission({ ctx });

        const cities = permissions
          .find((permission) => permission.id === "ViewCities")
          .subPermissions.filter((permission) => permission.isActive)
          .map((permission) => permission.enLabel);

        let filter = input.filter;
        // // temprory
        // filter.Start_Date = filter.Start_Date.filter((date) => {
        //   const m = moment(date, "jYYYY/jMM/jDD");
        //   m.locale("fa");
        //   console.log(m.isSameOrBefore(moment("1402/08/06", "jYYYY/jMM/jDD")));
        //   return m.isSameOrBefore(moment("1402/08/06", "jYYYY/jMM/jDD"));
        // });
        // if (filter.Start_Date.length <= 0)
        //   return {
        //     periodType: input.periodType,
        //     result: [],
        //   };
        // // end temprory
        filter.CityName = cities;

        const preName = "depos";
        let queryStart = `
`;

        let dbName = preName;
        let whereClause = "";

        if (input.periodType === "روزانه") {
          const dates = filter.Start_Date;
          // Convert date list to a SQL-safe list of N-prefixed quoted strings
          const dateList = dates.map((d) => `N'${d}'`).join(", ");

          // For DepoCount, pick a specific date (you used `at(-2)` before)
          const depoDate = dates.at(-1); // Optional: add fallback logic if needed

          queryStart = `
           USE RAMP_Daily;
           
           SELECT 
             DISTINCT 
             depos.ServiceName,
             depos.CityName,
             depos.DocumentType,
           
             SUM(CASE 
               WHEN Start_Date IN (${dateList}) THEN depos.EntryCount 
               ELSE 0 
             END) AS EntryCount,
           
             SUM(CASE 
               WHEN Start_Date IN (${dateList}) THEN depos.Capicity 
               ELSE 0 
             END) AS Capicity,
           
             SUM(CASE 
               WHEN Start_Date = N'${depoDate}' THEN depos.DepoCount 
               ELSE 0 
             END) AS DepoCount
           
           FROM 
             depos
           `;

          whereClause = generateWhereClause(filter);
          whereClause += ` Group By ServiceName,CityName,DocumentType,Start_Date ORDER BY CityName`;
        } else if (input.periodType === "هفتگی") {
          const dates = getDatesBetweenTwoDates(
            filter.Start_Date[0],
            filter.Start_Date[1],
          );

          // Convert date list to a SQL-safe list of N-prefixed quoted strings
          const dateList = dates.map((d) => `N'${d}'`).join(", ");

          // For DepoCount, pick a specific date (you used `at(-2)` before)
          const depoDate = dates.at(-2); // Optional: add fallback logic if needed

          queryStart = `
          USE RAMP_Daily;
          
          SELECT 
            DISTINCT 
            depos.ServiceName,
            depos.CityName,
            depos.DocumentType,
          
            SUM(CASE 
              WHEN Start_Date IN (${dateList}) THEN depos.EntryCount 
              ELSE 0 
            END) AS EntryCount,
          
            SUM(CASE 
              WHEN Start_Date IN (${dateList}) THEN depos.Capicity 
              ELSE 0 
            END) AS Capicity,
          
            SUM(CASE 
              WHEN Start_Date = N'${depoDate}' THEN depos.DepoCount 
              ELSE 0 
            END) AS DepoCount
          
          FROM 
            depos
          `;

          filter.Start_Date = dates;

          whereClause = generateWhereClause(filter);
          whereClause += ` GROUP BY CityName, ServiceName, DocumentType ORDER BY CityName`;
        } else if (input.periodType === "ماهانه") {
          filter.Start_Date = filter.Start_Date.map((d) => {
            return extractYearAndMonth(d);
          });

          let dates = filter.Start_Date.map((d) => {
            const _d = d.split("/");

            return `${_d[0]}/${_d[1]}/%`;
          });

          const date = filter.Start_Date.at(-1).split("/");

          const secondDayOfNextMonth = getSecondOrLaterDayOfNextMonth(
            parseInt(date[0]),
            parseInt(date[1]),
          );

          const dateResult = await sql.query(`

                 use RAMP_Daily
                  SELECT TOP 1 
              COALESCE(
                (SELECT MAX(Start_Date) FROM depos WHERE Start_Date = '${secondDayOfNextMonth}'),
                (SELECT MAX(Start_Date) FROM depos)
              ) AS LastDate
            FROM depos
            `);

          const lastDate = dateResult.recordset[0].LastDate;
          const lastDateMonth = lastDate.split("/")[1];
          const datesMonths = dates.map((date) => date.split("/")[1]);

          const likeConditionsGeneral = [
            ...dates,
            ...(datesMonths.includes(lastDateMonth) ? [] : [lastDate]),
          ]
            .map((date) => `Start_Date LIKE '${date}' `)
            .join(" OR ");

          const likeConditionsForEachProperty = [...dates]
            .map((date) => `Start_Date LIKE '${date}' `)
            .join(" OR ");
          // const secondDate = secondDayOfNextMonth.split("/");
          whereClause = generateWhereClause(
            filter,
            ["Start_Date"],
            undefined,
            `(${likeConditionsGeneral})` + " AND ",
          );
          whereClause += ` group by ServiceName,DocumentType,CityName ORDER BY CityName`;

          // const lastWeek = getFirstSaturdayOfLastWeekOfMonth(
          //   parseInt(date[0]),
          //   parseInt(date[1]),
          // );

          // console.log(date, lastWeek);
          // const monthName = moment()
          //   .locale("fa")
          //   .month(parseInt(date[1]) - 1)
          //   .format("MMMM");
          // queryStart = `
          // SELECT distinct depos.ServiceName,depos.CityName,depos.DocumentType,SUM(depos.EntryCount) AS EntryCount ,SUM(depos.Capicity) AS Capicity,
          // SUM(CASE WHEN Start_Date = '${lastWeek}' THEN DepoCount ELSE 0 END) AS DepoCount

          // FROM
          // `;

          queryStart = `
          SELECT distinct ServiceName,CityName,DocumentType,

               SUM(CASE 
              WHEN ${likeConditionsForEachProperty} 
              THEN EntryCount 
              ELSE 0 
          END) AS EntryCount,


          SUM(CASE 
             WHEN ${likeConditionsForEachProperty} 
              THEN Capicity 
              ELSE 0 
          END) AS Capicity,
              SUM(CASE WHEN Start_Date = '${lastDate}' THEN DepoCount ELSE 0 END) AS DepoCount

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
          result:
            finalResult.map((cf) => {
              return {
                ...cf,
                CityName: getEnglishToPersianCity(cf.CityName),
                ServiceName: ServiceNames[cf.ServiceName]
                  ? ServiceNames[cf.ServiceName]
                  : cf.ServiceName,
              };
            }) ?? [],
        };
        // Respond with the fetched data
      } catch (error) {
        console.error("Error fetching data:", error, error.message);
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
      const queryCities = `use RAMP_Daily  SELECT DISTINCT CityName FROM depos ${whereClause} ORDER BY CityName ASC
      `;

      const resultOfCities = await sql.query(queryCities);

      // const queryDocumentTypes = `SELECT DISTINCT DocumentType FROM RAMP_Daily.dbo.depos`;
      console.log(queryCities);
      // const resultOfDocumentTypes = await sql.query(queryDocumentTypes);

      const result = {
        Cities: resultOfCities.recordsets[0]
          .filter((c) => c.CityName !== "")
          .map((c) => {
            return {
              CityName: getEnglishToPersianCity(c.CityName),
            };
          }),
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

        const commonCities = cities.filter(
          (item) => input.filter.CityName?.includes(item),
        );

        const days = getDatesForLastMonth();
        const whereClause = generateWhereClause(
          {
            CityName: commonCities,
            Start_Date: days,
          },
          undefined,
          undefined,
          " ServiceName like N'ثبت%' AND ",
        );
        const queryDaysOfMonth = `SELECT 
        Start_Date, 
        SUM(DepoCount) AS DepoCount, 
        SUM(EntryCount) AS EntryCount, 
        SUM(Capicity) AS Capicity FROM RAMP_Daily.dbo.depos 
        ${whereClause}
        GROUP BY Start_Date ORDER BY Start_Date
        `;

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

          if (depoCompleteTime < 0) {
            track.color = "rose";
          } else if (depoCompleteTime == 0) {
            track.color = "amber";
          } else {
            // if more than zero
            performance += 1;
            track.color = "emerald";
          }

          track.tooltip = d.Start_Date;
        });

        // const percentage = (result.performance / 31) * 100;
        //  result.performance = Math.round(percentage / 10) * 10;
        result.performance = Math.floor(
          (performance /
            result.tracker.filter((a) => a.color !== "stone").length) *
            100,
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
