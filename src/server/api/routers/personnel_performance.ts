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
import { CITIES } from "~/constants";

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
export const personnelPerformanceRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        // limit: z.number().min(1).max(100).nullish().default(10),
        // cursor: z.string().nullish(),
        periodType: z
          .string(z.enum(["روزانه", "هفتگی", "ماهانه"]))
          .default("روزانه"),
        filter: z.object({
          CityName: z.array(z.string()).nullish().default([]),
          DocumentType: z.array(z.string()).nullish(),
          Start_Date: z.array(z.string()).min(1).max(10),
          NameFamily: z.array(z.string()).nullish(),
          ProjectType: z.array(z.string()).nullish(),
          ContractType: z.array(z.string()).nullish(),
          Role: z.array(z.string()).nullish(),
          RoleType: z.array(z.string()).nullish(),
          DateInfo: z.array(z.string()).nullish().default(["1402/03/31"]),
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

        if (filter.CityName?.length > 0)
          filter.CityName = cities.filter((value) =>
            input.filter.CityName.includes(value),
          );

        if (filter.CityName.length <= 0) filter.CityName = cities;
        if (input.periodType === "ماهانه" && filter.CityName.length > 3)
          throw new Error(
            "more than 3 cities in monthly filter is not allowed",
          );

        let queryStart = `
        SELECT Distinct CityName,NameFamily,u.NationalCode, ProjectType,ContractType,Role,RoleType,
        
        SUM(SabtAvalieAsnad) as SabtAvalieAsnad,
        SUM(PazireshVaSabtAvalieAsnad) as PazireshVaSabtAvalieAsnad,
        SUM(ArzyabiAsanadBimarsetaniDirect) as ArzyabiAsanadBimarsetaniDirect ,
	    	SUM(ArzyabiAsnadBimarestaniIndirect) as ArzyabiAsnadBimarestaniIndirect ,
        SUM(ArzyabiAsnadDandanVaParaDirect) as ArzyabiAsnadDandanVaParaDirect ,
	    	SUM(ArzyabiAsnadDandanVaParaIndirect) as ArzyabiAsnadDandanVaParaIndirect ,
        SUM(ArzyabiAsnadDaroDirect) as ArzyabiAsnadDaroDirect ,
	      SUM(ArzyabiAsnadDaroIndirect) as ArzyabiAsnadDaroIndirect ,
        SUM(WithScanCount) as WithScanCount,
        SUM(WithoutScanCount) as WithoutScanCount,
        SUM(WithoutScanInDirectCount) as WithoutScanInDirectCount,
        SUM(TotalPerformance) as TotalPerformance, 
        
        DateInfo,Start_Date from dbName1 as p
        JOIN dbName2 as u on p.NationalCode = u.NationalCode  
         `;
        let dbName1 = "";
        let dbName2 = "";
        let whereClause = "";

        if (input.periodType === "روزانه") {
          dbName1 = "RAMP_Daily.dbo.personnel_performance";
          dbName2 = "RAMP_Daily.dbo.users_info";
          whereClause = generateWhereClause(filter);
          whereClause += ` Group By CityName,NameFamily,u.NationalCode,ProjectType,ContractType,Role,RoleType,DateInfo,Start_Date

          Order By CityName,NameFamily `;
        } else if (input.periodType === "هفتگی") {
          dbName1 = "RAMP_Weekly.dbo.personnel_performance";
          dbName2 = "RAMP_Daily.dbo.users_info";
          filter.Start_Date = [filter.Start_Date[0]];

          whereClause = generateWhereClause(filter);
          whereClause += ` Group By CityName,NameFamily,u.NationalCode,ProjectType,ContractType,Role,RoleType,DateInfo,Start_Date

          Order By CityName,NameFamily `;
        } else if (input.periodType === "ماهانه") {
          queryStart = `SELECT Distinct CityName,NameFamily,u.NationalCode, ProjectType,ContractType,Role,RoleType,
        
          SUM(SabtAvalieAsnad) as SabtAvalieAsnad,
          SUM(PazireshVaSabtAvalieAsnad) as PazireshVaSabtAvalieAsnad,
          SUM(ArzyabiAsanadBimarsetaniDirect) as ArzyabiAsanadBimarsetaniDirect ,
          SUM(ArzyabiAsnadBimarestaniIndirect) as ArzyabiAsnadBimarestaniIndirect ,
          SUM(ArzyabiAsnadDandanVaParaDirect) as ArzyabiAsnadDandanVaParaDirect ,
          SUM(ArzyabiAsnadDandanVaParaIndirect) as ArzyabiAsnadDandanVaParaIndirect ,
          SUM(ArzyabiAsnadDaroDirect) as ArzyabiAsnadDaroDirect ,
          SUM(ArzyabiAsnadDaroIndirect) as ArzyabiAsnadDaroIndirect ,
          SUM(WithScanCount) as WithScanCount,
          SUM(WithoutScanCount) as WithoutScanCount,
          SUM(WithoutScanInDirectCount) as WithoutScanInDirectCount,
          SUM(TotalPerformance) as TotalPerformance,  DateInfo,Start_Date
          
          from dbName1 as p
          JOIN dbName2 as u on p.NationalCode = u.NationalCode  
           `;

          dbName1 = "RAMP_Daily.dbo.personnel_performance";
          dbName2 = "RAMP_Daily.dbo.users_info";

          filter.Start_Date = filter.Start_Date.map((d) => {
            return extractYearAndMonth(d);
          });

          const date = filter.Start_Date[0].split("/");
          whereClause = generateWhereClause(
            filter,
            ["Start_Date"],
            undefined,
            `SUBSTRING(Start_Date, 1, 7) IN ('${date[0]}/${date[1]}') AND `,
          );

          whereClause += ` Group By CityName,NameFamily,ProjectType,u.NationalCode,ContractType,Role,RoleType,DateInfo,Start_Date
            
          Order By CityName,NameFamily `;
          // const date = filter.Start_Date[0].split("/");
          // const lastWeek = getFirstSaturdayOfLastWeekOfMonth(
          //   parseInt(date[0]),
          //   parseInt(date[1]),
          // );

          // console.log(date, lastWeek);
          // const monthName = moment()
          //   .locale("fa")
          //   .month(parseInt(date[1]) - 1)
          //   .format("MMMM");
          //   queryStart = `
          //   SELECT distinct depos.ServiceName,depos.CityName,depos.DocumentType,SUM(depos.EntryCount) AS EntryCount ,SUM(depos.Capicity) AS Capicity,
          //   SUM(CASE WHEN Start_Date = '${lastWeek}' THEN DepoCount ELSE 0 END) AS DepoCount

          //   FROM
          //   `;
        }

        queryStart = queryStart.replace("dbName1", dbName1);
        queryStart = queryStart.replace("dbName2", dbName2);
        let query = `
        ${queryStart}
       
        ${whereClause}
        `;
        // console.log(query);
        const result = await sql.query(query);
        // console.log({ input });
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
                CityName: CITIES.find((a) => a.EnglishName === cf.CityName)
                  .PersianName,
              };
            }) ?? [],
        };
        // Respond with the fetched data
      } catch (error) {
        console.error("Error fetching data:", error.message);
        return error;
      }
    }),
  getInitialFilters: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Connect to SQL Server

      const permissions = await getPermission({ ctx });
      const cities = permissions
        .find((permission) => permission.id === "ViewCities")
        .subPermissions.filter((permission) => permission.isActive)
        .map((permission) => permission.enLabel);

      const whereClause = generateWhereClause({ CityName: cities });
      const query = `SELECT DISTINCT Role,RoleType,ContractType,ProjectType,DateInfo FROM RAMP_Daily.dbo.users_info

      SELECT DISTINCT CityName from RAMP_Daily.dbo.personnel_performance

      ${whereClause}
      `;

      const result = await sql.query(query);
      // console.log(result.recordsets);
      return {
        usersInfo: result.recordsets[0],
        Cities: result.recordsets[1]
          .filter((c) => c.CityName !== "")
          .map((c) => {
            return {
              CityName: CITIES.find((a) => a.EnglishName === c.CityName)
                .PersianName,
            };
          }),
      };
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

        // console.log(JSON.stringify(commonCities, null, 2));
        const days = getDatesForLastMonth();
        const whereClause = generateWhereClause({
          CityName: commonCities,
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
  getCities: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Connect to SQL Server

      const permissions = await getPermission({ ctx });
      const cities = permissions
        .find((permission) => permission.id === "ViewCities")
        .subPermissions.filter((permission) => permission.isActive)
        .map((permission) => permission.enLabel);

      const whereClause = generateWhereClause({ CityName: cities });
      const queryCities = `SELECT DISTINCT CityName FROM RAMP_Daily.dbo.personnel_performance ${whereClause} ORDER BY CityName ASC
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
  getCitiesWithPerformance: protectedProcedure
    .input(
      z.object({
        periodType: z.enum(["روزانه", "هفتگی", "ماهانه"]).default("روزانه"),
        filter: z.object({
          CityName: z.array(z.string()).nullish().default([]),
          Start_Date: z.array(z.string()).nullish(),
          ProjectType: z.array(z.string()).nullish(),
          ContractType: z.array(z.string()).nullish(),
          Role: z.array(z.string()).nullish(),
          RoleType: z.array(z.string()).nullish(),
          DateInfo: z.array(z.string()).nullish().default(["1402/03/31"]),
        }),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        // Connect to SQL Server
        let filter = input.filter;
        const permissions = await getPermission({ ctx });
        const cities = permissions
          .find((permission) => permission.id === "ViewCities")
          .subPermissions.filter((permission) => permission.isActive)
          .map((permission) => permission.enLabel);

        let whereClause = generateWhereClause({
          ...filter,
          CityName: cities,
          Start_Date: input.filter.Start_Date,
        });

        if (filter.CityName?.length > 0)
          filter.CityName = cities.filter((value) =>
            filter.CityName.includes(value),
          );
        if (filter.CityName.length <= 0) filter.CityName = cities;
        // let queryCities = `SELECT DISTINCT CityName FROM RAMP_Daily.dbo.personnel_performance ${whereClause} ORDER BY CityName ASC
        // `;

        let queryCities = `
          
          
        SELECT DISTINCT CityName,SUM(TotalPerformance) / Count(CityName) as TotalPerformance,p.Start_Date 
        FROM dbName.dbo.personnel_performance as p
        JOIN
        RAMP_Daily.dbo.users_info as u ON p.NationalCode = u.NationalCode
            ${whereClause}

        group by CityName,p.Start_Date ORDER BY CityName ASC
        `;

        if (input.periodType === "هفتگی") {
          filter.Start_Date = [filter.Start_Date[0]];

          whereClause = generateWhereClause(filter);
        }
        if (input.periodType === "ماهانه") {
          filter.Start_Date = filter.Start_Date.map((d) => {
            return extractYearAndMonth(d);
          });
          const date = filter.Start_Date[0].split("/");
          whereClause = generateWhereClause(filter, ["Start_Date"], undefined);
          queryCities = `
          
          
          SELECT DISTINCT CityName,SUM(TotalPerformance) / Count(CityName) as TotalPerformance,p.Start_Date 
          FROM dbName.dbo.personnel_performance as p
          JOIN
          RAMP_Daily.dbo.users_info as u ON p.NationalCode = u.NationalCode
              ${whereClause} AND Start_Date LIKE '${date[0]}/${date[1]}%'
  
          group by CityName,p.Start_Date ORDER BY CityName ASC
          `;
        }

        if (input.periodType === "هفتگی")
          queryCities = queryCities.replaceAll("dbName", "RAMP_Weekly");
        else queryCities = queryCities.replaceAll("dbName", "RAMP_Daily");

        // console.log(queryCities);
        const resultOfCities = await sql.query(queryCities);

        // const queryDocumentTypes = `SELECT DISTINCT DocumentType FROM RAMP_Daily.dbo.depos`;
        // console.log(queryDocumentTypes);
        // const resultOfDocumentTypes = await sql.query(queryDocumentTypes);

        // const result = {
        //   Cities: resultOfCities.recordsets[0].filter((c) => c.CityName !== ""),
        // };

        return resultOfCities.recordsets[0];
        // Respond with the fetched data
      } catch (error) {
        console.error("Error fetching data:", error.message);
        return error;
      }
    }),
  getUsersByCityName: protectedProcedure
    .input(
      z.object({
        cityName: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const permissions = await getPermission({ ctx });
      const cities = permissions
        .find((permission) => permission.id === "ViewCities")
        .subPermissions.filter((permission) => permission.isActive)
        .map((permission) => permission.enLabel);

      if (!cities.includes(input.cityName)) return;
      let queryStart = `SELECT Distinct CityName,NameFamily, ProjectType,ContractType,Role,RoleType,
        
      SUM(SabtAvalieAsnad) as SabtAvalieAsnad,
      SUM(PazireshVaSabtAvalieAsnad) as PazireshVaSabtAvalieAsnad,
      SUM(ArzyabiAsanadBimarsetaniDirect) as ArzyabiAsanadBimarsetaniDirect ,
      SUM(ArzyabiAsnadBimarestaniIndirect) as ArzyabiAsnadBimarestaniIndirect ,
      SUM(ArzyabiAsnadDandanVaParaDirect) as ArzyabiAsnadDandanVaParaDirect ,
      SUM(ArzyabiAsnadDandanVaParaIndirect) as ArzyabiAsnadDandanVaParaIndirect ,
      SUM(ArzyabiAsnadDaroDirect) as ArzyabiAsnadDaroDirect ,
      SUM(ArzyabiAsnadDaroIndirect) as ArzyabiAsnadDaroIndirect ,
      SUM(TotalPerformance) as TotalPerformance, 
      SUM(WithScanCount) as WithScanCount,
      SUM(WithoutScanCount) as WithoutScanCount,
      SUM(WithoutScanInDirectCount) as WithoutScanInDirectCount,
      DateInfo,Start_Date from dbName1 as p
      JOIN dbName2 as u on p.NationalCode = u.NationalCode  
       `;
    }),

  getUserByNationalCode: protectedProcedure
    .input(
      z.object({
        nationalCode: z.string(),
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

        const whereClause = generateWhereClause({ CityName: cities });
        const queryCities = `SELECT * FROM RAMP_Daily.dbo.personnel_performance ${whereClause} ORDER BY CityName ASC
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
});

function generateFilterOnlySelect(filter: string[]) {
  const columns = [];
  filter.map((column) => {
    columns.push(column);
  });

  return columns.length > 0 ? `${columns.join(",")}` : "";
}

// function generateWhereClause(
//   filter,
//   ignoreKey = undefined,
//   customFun = undefined,
// ) {
//   const conditions = [];

//   for (const key in filter) {
//     const value = filter[key];
//     if (Array.isArray(value)) {
//       // If the value is an array, create a condition with IN operator
//       const newValue = [];
//       value.forEach((v) => {
//         newValue.push(`N'${v}'`);
//       });

//       const cw = ignoreKey === key && customFun ? customFun : key;
//       const condition = `${cw} IN (${newValue.join(",")})`;
//       if (value.length > 0) conditions.push(condition);
//     } else if (value !== undefined && value !== null) {
//       const condition = `${key} = '${value}'`;
//       conditions.push(condition);
//     }
//   }
//   return conditions.length > 0
//     ? `WHERE CityName is not NULL AND ${conditions.join(" AND ")}`
//     : "";
// }
