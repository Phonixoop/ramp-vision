import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import moment from "jalali-moment";
import {
  calculateDepoCompleteTime,
  extractYearAndMonth,
  getDatesBetweenTwoDates,
  getDatesForLastMonth,
  getWeekOfMonth,
} from "~/utils/date-utils";

import { generateWhereClause, getPermission } from "~/server/server-utils";
import { TremorColor } from "~/types";
import {
  getEnglishToPersianCity,
  getPerformanceText,
  getPerformanceTextEn,
  getPersianToEnglishCity,
} from "~/utils/util";
import { defaultProjectTypes } from "~/constants/personnel-performance";
import { getUserPermissions } from "~/lib/user.util";
import { sortDates } from "~/lib/utils";
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
          DateInfo: z.array(z.string().nullish()).nullish(),
          TownName: z.array(z.string()).nullish(),
          BranchName: z.array(z.string()).nullish(),
          BranchCode: z.array(z.string()).nullish(),
          BranchType: z.array(z.string()).nullish(),
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

        // const defualtDateInfo = await getDefualtDateInfo();
        // filter.DateInfo = [defualtDateInfo];
        // if (input.periodType === "ماهانه" && filter.CityName.length > 3)
        //   throw new Error(
        //     "more than 3 cities in monthly filter is not allowed",
        //   );
        console.log({ filter: filter.CityName });
        let queryStart = `
        SELECT Distinct CityName,NameFamily,u.NationalCode, ProjectType,ContractType,Role,RoleType,HasTheDayOff,

        TownName,
        BranchCode,
        BranchName,
        BranchType,
        
        SUM(SabtAvalieAsnad) as SabtAvalieAsnad,
        SUM(PazireshVaSabtAvalieAsnad) as PazireshVaSabtAvalieAsnad,
        SUM(ArzyabiAsanadBimarsetaniDirect) as ArzyabiAsanadBimarsetaniDirect ,
	    	SUM(ArzyabiAsnadBimarestaniIndirect) as ArzyabiAsnadBimarestaniIndirect ,
        SUM(ArzyabiAsnadDandanVaParaDirect) as ArzyabiAsnadDandanVaParaDirect ,
	    	SUM(ArzyabiAsnadDandanVaParaIndirect) as ArzyabiAsnadDandanVaParaIndirect ,
        SUM(ArzyabiAsnadDandanDirect) as ArzyabiAsnadDandanDirect ,
        SUM(ArzyabiAsnadDandanIndirect) as ArzyabiAsnadDandanIndirect ,
        SUM(ArzyabiAsnadDaroDirect) as ArzyabiAsnadDaroDirect ,
	      SUM(ArzyabiAsnadDaroIndirect) as ArzyabiAsnadDaroIndirect ,
        SUM(WithScanCount) as WithScanCount,
        SUM(WithoutScanCount) as WithoutScanCount,
        SUM(WithoutScanInDirectCount) as WithoutScanInDirectCount,
        SUM(ArchiveDirectCount) as ArchiveDirectCount,
        SUM(ArchiveInDirectCount) as ArchiveInDirectCount,
        SUM(ArzyabiVisitDirectCount) as ArzyabiVisitDirectCount,
      

        SUM(TotalPerformance) as TotalPerformance, 
        
        SUM(DirectPerFormance) as DirectPerFormance, 
        SUM(InDirectPerFormance) as InDirectPerFormance, 

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
          whereClause += ` Group By CityName,NameFamily,u.NationalCode,ProjectType,ContractType,Role,RoleType,DateInfo,Start_Date,HasTheDayOff, TownName,
          BranchCode,
          BranchName,
          BranchType

          Order By CityName,NameFamily `;
        } else if (input.periodType === "هفتگی") {
          dbName1 = "RAMP_Daily.dbo.personnel_performance";
          dbName2 = "RAMP_Daily.dbo.users_info";
          filter.Start_Date = getDatesBetweenTwoDates(
            filter.Start_Date[0],
            filter.Start_Date[1],
          );

          whereClause = generateWhereClause(filter);
          whereClause += ` Group By CityName,NameFamily,u.NationalCode,ProjectType,ContractType,Role,RoleType,DateInfo,Start_Date,HasTheDayOff, TownName,
          BranchCode,
          BranchName,
          BranchType

          Order By CityName,NameFamily `;
        } else if (input.periodType === "ماهانه") {
          queryStart = `SELECT Distinct CityName,NameFamily,u.NationalCode, ProjectType,ContractType,Role,RoleType,HasTheDayOff,
          TownName,
          BranchCode,
          BranchName,
          BranchType,

          SUM(SabtAvalieAsnad) as SabtAvalieAsnad,
          SUM(PazireshVaSabtAvalieAsnad) as PazireshVaSabtAvalieAsnad,
          SUM(ArzyabiAsanadBimarsetaniDirect) as ArzyabiAsanadBimarsetaniDirect ,
          SUM(ArzyabiAsnadBimarestaniIndirect) as ArzyabiAsnadBimarestaniIndirect ,
          SUM(ArzyabiAsnadDandanVaParaDirect) as ArzyabiAsnadDandanVaParaDirect ,
          SUM(ArzyabiAsnadDandanVaParaIndirect) as ArzyabiAsnadDandanVaParaIndirect ,
          SUM(ArzyabiAsnadDandanDirect) as ArzyabiAsnadDandanDirect ,
          SUM(ArzyabiAsnadDandanIndirect) as ArzyabiAsnadDandanIndirect ,
          SUM(ArzyabiAsnadDaroDirect) as ArzyabiAsnadDaroDirect ,
          SUM(ArzyabiAsnadDaroIndirect) as ArzyabiAsnadDaroIndirect ,
          SUM(WithScanCount) as WithScanCount,
          SUM(WithoutScanCount) as WithoutScanCount,
          SUM(WithoutScanInDirectCount) as WithoutScanInDirectCount,
          SUM(ArchiveDirectCount) as ArchiveDirectCount,
          SUM(ArchiveInDirectCount) as ArchiveInDirectCount,
          SUM(ArzyabiVisitDirectCount) as ArzyabiVisitDirectCount,
          SUM(TotalPerformance) as TotalPerformance,DateInfo,Start_Date,
          
          SUM(DirectPerFormance) as DirectPerFormance, 
          SUM(InDirectPerFormance) as InDirectPerFormance

          from dbName1 as p
          JOIN dbName2 as u on p.NationalCode = u.NationalCode  
           `;

          dbName1 = "RAMP_Daily.dbo.personnel_performance";
          dbName2 = "RAMP_Daily.dbo.users_info";

          filter.Start_Date = filter.Start_Date.map((d) => {
            return extractYearAndMonth(d);
          });

          // let dates = filter.Start_Date.map((d) => {
          //   const _d = d.split("/");
          //   return `'${_d[0]}/${_d[1]}'`;
          // });

          let dates = filter.Start_Date.map((d) => {
            const _d = d.split("/");

            return `LIKE '${_d[0]}/${_d[1]}/%'`;
          });
          const likeConditions = dates
            .map((date) => `Start_Date  ${date} `)
            .join(" OR ");
          whereClause = generateWhereClause(
            filter,
            ["Start_Date"],
            undefined,
            likeConditions + " AND ",
            //    `SUBSTRING(Start_Date, 1, 7) IN (${dates.join(",")}) AND `,
          );

          whereClause += ` Group By CityName,NameFamily,ProjectType,u.NationalCode,ContractType,Role,RoleType,DateInfo,Start_Date,HasTheDayOff, TownName,
          BranchCode,
          BranchName,
          BranchType
            
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

        console.log(query);
        const result = await sql.query(query);
        if (input.periodType === "روزانه") {
          finalResult = result.recordsets[0];
        }
        if (input.periodType === "هفتگی") {
          // const date = filter.Start_Date[0].split("/");

          // const monthName = moment()
          //   .locale("fa")
          //   .month(parseInt(date[1]) - 1)
          //   .format("MMMM");

          // const weekNumber = getWeekOfMonth(filter.Start_Date[0]);
          // const weekName = `هفته ${weekNumber} ${monthName}`;

          // finalResult = result.recordsets[0].map((record) => {
          //   return {
          //     ...record,
          //     Start_Date: weekName,
          //   };
          // });
          finalResult = result.recordsets[0];
        }

        if (input.periodType === "ماهانه") {
          // const date = filter.Start_Date[0].split("/");

          // const monthName = moment()
          //   .locale("fa")
          //   .month(parseInt(date[1]) - 1)
          //   .format("MMMM");

          // finalResult = result.recordsets[0].map((record) => {
          //   return {
          //     ...record,
          //     Start_Date: monthName,
          //   };
          // });
          finalResult = result.recordsets[0];
        }

        const uniqueData = result.recordsets[0].filter(
          (obj, index, self) =>
            index ===
            self.findIndex(
              (o) =>
                o.CityName === obj.CityName && o.Start_Date === obj.Start_Date,
            ),
        );

        const dateLengthPerCityName = uniqueData.reduce((acc, curr) => {
          const cityName = curr.CityName;
          acc[cityName] = (acc[cityName] || 0) + 1;
          return acc;
        }, {});

        return {
          periodType: input.periodType,
          dateLength: dateLengthPerCityName,
          result:
            finalResult.map((cf) => {
              return {
                ...cf,
                CityName: getEnglishToPersianCity(cf.CityName),
              };
            }) ?? [],
        };
      } catch (error) {
        console.error("Error fetching data:", error.message);
        return error;
      }
    }),
  getCitiesWithPerformance: protectedProcedure
    .input(
      z.object({
        periodType: z.enum(["روزانه", "هفتگی", "ماهانه"]).default("ماهانه"),
        filter: z.object({
          CityName: z.array(z.string()).nullish().default([]),
          Start_Date: z.array(z.string()).nullish(),
          ProjectType: z.array(z.string()).nullish(),
          ContractType: z.array(z.string()).nullish(),
          Role: z.array(z.string()).nullish(),
          RoleType: z.array(z.string()).nullish(),
          DateInfo: z.array(z.string().nullish()).nullish(),
          TownName: z.array(z.string()).nullish(),
          BranchName: z.array(z.string()).nullish(),
          BranchCode: z.array(z.string()).nullish(),
          BranchType: z.array(z.string()).nullish(),
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

        // const defualtDateInfo = await getDefualtDateInfo();
        // filter.DateInfo = [defualtDateInfo];
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
        
        
     
      SELECT
      CityName,
      p.Start_Date,
      COUNT(*) AS COUNT,
      SUM(TotalPerformance) AS TotalPerformance,
      SUM(DirectPerFormance) AS DirectPerFormance,
      SUM(InDirectPerFormance) AS InDirectPerFormance,
      
      SUM(SabtAvalieAsnad) as SabtAvalieAsnad,
      SUM(PazireshVaSabtAvalieAsnad) as PazireshVaSabtAvalieAsnad,
      SUM(ArzyabiAsanadBimarsetaniDirect) as ArzyabiAsanadBimarsetaniDirect ,
      SUM(ArzyabiAsnadBimarestaniIndirect) as ArzyabiAsnadBimarestaniIndirect ,
      SUM(ArzyabiAsnadDandanVaParaDirect) as ArzyabiAsnadDandanVaParaDirect ,
      SUM(ArzyabiAsnadDandanVaParaIndirect) as ArzyabiAsnadDandanVaParaIndirect ,
      SUM(ArzyabiAsnadDandanDirect) as ArzyabiAsnadDandanDirect ,
      SUM(ArzyabiAsnadDandanIndirect) as ArzyabiAsnadDandanIndirect ,
      SUM(ArzyabiAsnadDaroDirect) as ArzyabiAsnadDaroDirect ,
      SUM(ArzyabiAsnadDaroIndirect) as ArzyabiAsnadDaroIndirect ,
      SUM(WithScanCount) as WithScanCount,
      SUM(WithoutScanCount) as WithoutScanCount,
      SUM(WithoutScanInDirectCount) as WithoutScanInDirectCount,
      SUM(ArchiveDirectCount) as ArchiveDirectCount,
      SUM(ArchiveInDirectCount) as ArchiveInDirectCount,
      SUM(ArzyabiVisitDirectCount) as ArzyabiVisitDirectCount

      FROM dbName.dbo.personnel_performance as p
      JOIN
      RAMP_Daily.dbo.users_info as u ON p.NationalCode = u.NationalCode
      whereClause AND HasTheDayOff = 0

      group by CityName,p.Start_Date ORDER BY CityName ASC
      `;

        if (input.periodType === "هفتگی") {
          filter.Start_Date = getDatesBetweenTwoDates(
            filter.Start_Date[0],
            filter.Start_Date[1],
          );

          whereClause = generateWhereClause(filter);
        }
        if (input.periodType === "ماهانه") {
          filter.Start_Date = filter.Start_Date.map((d) => {
            return extractYearAndMonth(d);
          });

          let dates = filter.Start_Date.map((d) => {
            const _d = d.split("/");

            return `LIKE '${_d[0]}/${_d[1]}/%'`;
          });
          //   const date = filter.Start_Date[0].split("/");
          whereClause = generateWhereClause(filter, ["Start_Date"], undefined);

          queryCities = `
              
        SELECT
        CityName,
        p.Start_Date,
        COUNT(*) AS COUNT,
        SUM(TotalPerformance) AS TotalPerformance,
        SUM(DirectPerFormance) AS DirectPerFormance,
        SUM(InDirectPerFormance) AS InDirectPerFormance,
        
        SUM(SabtAvalieAsnad) as SabtAvalieAsnad,
        SUM(PazireshVaSabtAvalieAsnad) as PazireshVaSabtAvalieAsnad,
        SUM(ArzyabiAsanadBimarsetaniDirect) as ArzyabiAsanadBimarsetaniDirect ,
        SUM(ArzyabiAsnadBimarestaniIndirect) as ArzyabiAsnadBimarestaniIndirect ,
        SUM(ArzyabiAsnadDandanVaParaDirect) as ArzyabiAsnadDandanVaParaDirect ,
        SUM(ArzyabiAsnadDandanVaParaIndirect) as ArzyabiAsnadDandanVaParaIndirect ,
        SUM(ArzyabiAsnadDandanDirect) as ArzyabiAsnadDandanDirect ,
        SUM(ArzyabiAsnadDandanIndirect) as ArzyabiAsnadDandanIndirect ,
        SUM(ArzyabiAsnadDaroDirect) as ArzyabiAsnadDaroDirect ,
        SUM(ArzyabiAsnadDaroIndirect) as ArzyabiAsnadDaroIndirect ,
        SUM(WithScanCount) as WithScanCount,
        SUM(WithoutScanCount) as WithoutScanCount,
        SUM(WithoutScanInDirectCount) as WithoutScanInDirectCount,
        SUM(ArchiveDirectCount) as ArchiveDirectCount,
        SUM(ArchiveInDirectCount) as ArchiveInDirectCount,
          SUM(ArzyabiVisitDirectCount) as ArzyabiVisitDirectCount
        
      
        FROM dbName.dbo.personnel_performance as p
        JOIN
        RAMP_Daily.dbo.users_info as u ON p.NationalCode = u.NationalCode
        whereClause AND (Start_Date ${dates.join(
          " OR Start_Date ",
        )}) AND HasTheDayOff = 0

        group by CityName,p.Start_Date ORDER BY CityName ASC
        `;
        }
        queryCities = queryCities.replace("whereClause", whereClause);
        queryCities = queryCities.replaceAll("dbName", "RAMP_Daily");
        // console.log(queryCities);
        const resultOfCities = await sql.query(queryCities);

        const uniqueData = resultOfCities.recordsets[0].filter(
          (obj, index, self) =>
            index ===
            self.findIndex(
              (o) =>
                o.CityName === obj.CityName && o.Start_Date === obj.Start_Date,
            ),
        );

        const dateLengthPerCityName = uniqueData.reduce((acc, curr) => {
          const cityName = curr.CityName;
          acc[cityName] = (acc[cityName] || 0) + 1;
          return acc;
        }, {});

        return {
          periodType: input.periodType,
          dateLength: dateLengthPerCityName,

          result: resultOfCities.recordsets[0],
        };
        // Respond with the fetched data
      } catch (error) {
        console.error("Error fetching data:", error.message);
        return error;
      }
    }),
  getInitialFilters: protectedProcedure
    .input(
      z
        .object({
          filter: z.object({
            ProjectType: z
              .array(z.string())
              .nullish()
              .default(defaultProjectTypes),
            DateInfo: z.array(z.string()).nullish(),
          }),
        })
        .optional(),
    )
    .query(async ({ input, ctx }) => {
      try {
        // Connect to SQL Server

        const permissions = await getPermission({ ctx });
        const cities = permissions
          .find((permission) => permission.id === "ViewCities")
          .subPermissions.filter((permission) => permission.isActive)
          .map((permission) => permission.enLabel);

        const whereClauseForRest = generateWhereClause({
          DateInfo: input.filter.DateInfo,
          ProjectType: input.filter.ProjectType,
        });
        const whereClauseForCity = generateWhereClause({
          CityName: cities,
        });

        const query = `
      SELECT DISTINCT Role,RoleType,ContractType,ProjectType,DateInfo
      

      FROM RAMP_Daily.dbo.users_info
      ${whereClauseForRest}

      
      SELECT DISTINCT CityName from RAMP_Daily.dbo.personnel_performance
      ${whereClauseForCity}


      SELECT DISTINCT DateInfo FROM RAMP_Daily.dbo.users_info

      SELECT DISTINCT ProjectType FROM RAMP_Daily.dbo.users_info WHERE ProjectType is not NULL AND ProjectType != ''  

      SELECT DISTINCT  TownName FROM RAMP_Daily.dbo.personnel_performance WHERE TownName is not NULL AND TownName != ''

      SELECT DISTINCT  BranchCode FROM RAMP_Daily.dbo.personnel_performance WHERE BranchCode is not NULL AND BranchCode != ''

      SELECT DISTINCT  BranchName FROM RAMP_Daily.dbo.personnel_performance WHERE BranchName is not NULL AND BranchName != ''

      SELECT DISTINCT  BranchType FROM RAMP_Daily.dbo.personnel_performance WHERE BranchType is not NULL AND BranchType != ''

     
      `;
        // console.log(query);
        const result = await sql.query(query);
        // console.log(result.recordsets);
        return {
          usersInfo: result.recordsets[0],

          CityNames: result.recordsets[1]
            .filter((c) => c.CityName !== "")
            .map((c) => {
              return getEnglishToPersianCity(c.CityName);
            }),
          DateInfos: result.recordsets[2],
          ProjectTypes: result.recordsets[3].map((c) => c.ProjectType),
          TownNames: result.recordsets[4].map((c) => c.TownName),
          BranchCodes: result.recordsets[5].map((c) => c.BranchCode),
          BranchNames: result.recordsets[6].map((c) => c.BranchName),
          BranchTypes: result.recordsets[7].map((c) => c.BranchType),
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
  getInitialCityNames: protectedProcedure.query(async ({ ctx }) => {
    const permissions = await getPermission({ ctx });
    const cities = permissions
      .find((permission) => permission.id === "ViewCities")
      .subPermissions.filter((permission) => permission.isActive)
      .map((permission) => permission.enLabel);

    const whereClauseForCity = generateWhereClause({
      CityName: cities,
    });

    const query = `

  
  SELECT DISTINCT CityName from RAMP_Daily.dbo.personnel_performance
  ${whereClauseForCity}



  `;
    // console.log(query);
    const result = await sql.query(query);

    const r = {
      CityNames: result.recordsets[0]
        .filter((c) => c.CityName !== "")
        .map((c) => {
          return getEnglishToPersianCity(c.CityName);
        }),
    };

    return r;
  }),
  getInitialCitiesPublic: publicProcedure.query(async ({ ctx }) => {
    const query = `

  
  SELECT DISTINCT CityName from RAMP_Daily.dbo.personnel_performance




  `;
    // console.log(query);
    const result = await sql.query(query);

    const r = {
      Cities: result.recordsets[0]
        .filter((c) => c.CityName !== "")
        .map((c) => {
          return getEnglishToPersianCity(c.CityName);
        }),
    };

    return r;
  }),
  getLastDate: publicProcedure.query(async ({ ctx }) => {
    const query = ` 
    SELECT TOP 1 Start_Date FROM RAMP_Daily.dbo.personnel_performance ORDER BY Start_Date DESC 
    `;

    const result = await sql.query(query);
    const value = result.recordsets[0][0]["Start_Date"];
    // console.log(result.recordsets);
    return value;
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
      SUM(ArzyabiAsnadDandanDirect) as ArzyabiAsnadDandanDirect ,
      SUM(ArzyabiAsnadDandanIndirect) as ArzyabiAsnadDandanIndirect ,
      SUM(ArzyabiAsnadDaroDirect) as ArzyabiAsnadDaroDirect ,
      SUM(ArzyabiAsnadDaroIndirect) as ArzyabiAsnadDaroIndirect ,
      SUM(TotalPerformance) as TotalPerformance, 
      SUM(WithScanCount) as WithScanCount,
      SUM(WithoutScanCount) as WithoutScanCount,
      SUM(WithoutScanInDirectCount) as WithoutScanInDirectCount,
      SUM(ArchiveDirectCount) as ArchiveDirectCount,
      SUM(ArchiveInDirectCount) as ArchiveInDirectCount,
      SUM(ArzyabiVisitDirectCount) as ArzyabiVisitDirectCount,
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

  togglePersonnelDayOff: protectedProcedure
    .input(
      z.object({
        cityName: z.string(),
        nameFamily: z.string(),
        nationalCode: z.string(),
        date: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      //  new Promise((resolve) => {
      //   setTimeout(resolve, 2000);
      // });
      // return
      const permissions = await getPermission({ ctx });
      if (!getUserPermissions(permissions).ManagePersonnel)
        throw new Error("You dont have permission to Manage Personnel");

      //   update personnel_performance set HasTheDayOff = 1 where NationalCode = '1381128971' and Start_Date = '1403/01/25'
      // const updateHasTheDayOffQuery = `

      // UPDATE personnel_performance
      // SET HasTheDayOff = CASE WHEN HasTheDayOff = 1 THEN 0 ELSE 1 END
      // WHERE NationalCode = '${input.nationalCode}' AND Start_Date = '${input.date}';

      // `;
      //console.log({ input });
      const updateHasTheDayOffQuery = `
      
      use RAMP_Daily

      IF NOT EXISTS (
        SELECT 1 
        FROM personnel_performance 
        WHERE NationalCode = '${input.nationalCode}' 
          AND Start_Date = '${input.date}'
          AND CityName = '${input.cityName}'
    )
    BEGIN
        -- Insert new record
        INSERT INTO personnel_performance 
                   ([NameFamily], 
                    [NationalCode], 
                    [CityName], 
                    [ArzyabiAsanadBimarsetaniDirect], 
                    [ArzyabiAsnadBimarestaniIndirect], 
                    [ArzyabiAsnadDaroDirect], 
                    [ArzyabiAsnadDaroIndirect], 
                    [ArzyabiAsnadDandanVaParaDirect], 
                    [ArzyabiAsnadDandanVaParaIndirect], 
                    [PazireshVaSabtAvalieAsnad], 
                    [SabtAvalieAsnad], 
                    [WithScanCount], 
                    [WithoutScanCount], 
                    [WithoutScanInDirectCount], 
                    [DirectPerFormance], 
                    [IndirectPerFormance], 
                    [TotalPerformance], 
                    [Start_Date], 
                    [End_Date], 
                    [CreatedAtPersian], 
                    [ArchiveDirectCount], 
                    [ArchiveInDirectCount], 
                    [ArzyabiVisitDirectCount],
                    [HasTheDayOff])
        VALUES (N'${input.nameFamily}', 
                '${input.nationalCode}', 
                '${input.cityName}', 
                0, 
               0, 
               0, 
               0, 
               0, 
               0, 
               0, 
               0, 
               0, 
           0, 
               0, 
               0, 
               0, 
               0, 
                '${input.date}', 
                '${input.date}', 
                '', 
               0, 
               0, 
               0,
               1); -- Assuming default value for HasTheDayOff is 1
    END
    ELSE
    BEGIN
        -- Toggle update
        UPDATE personnel_performance
        SET HasTheDayOff = CASE 
            WHEN HasTheDayOff = 0 THEN 1
            WHEN HasTheDayOff = 1 THEN 0
            ELSE HasTheDayOff
        END
        WHERE NationalCode = '${input.nationalCode}' 
          AND Start_Date = '${input.date}'
          AND CityName = '${input.cityName}'
    END
    
      
      `;

      const reuslt = await sql.query(updateHasTheDayOffQuery);

      return reuslt;
    }),

  getBestPersonnel: publicProcedure
    .input(
      z.object({
        filter: z.object({
          Start_Date: z.array(z.string()),
        }),
        periodType: z.enum(["روزانه", "هفتگی", "ماهانه"]),
      }),
    )
    .query(async ({ input }) => {
      const { filter, periodType } = input;
      const { Start_Date } = filter;

      const date = Start_Date.map((d) => extractYearAndMonth(d));

      // const englishCityNames = CityName.map(
      //   (city) => `'${getPersianToEnglishCity(city)}'`,
      // ).join(", ");

      const lastDateInfo = await getDefualtDateInfo();
      /*${
            englishCityNames.length > 0
              ? `AND CityName IN (${englishCityNames})`
              : ``
          } */
      const query = `
        SELECT DISTINCT
          NameFamily,
          u.NationalCode,
          AVG(TotalPerformance) AS TotalPerformance,
          CityName
        FROM RAMP_Daily.dbo.personnel_performance AS p
        JOIN RAMP_Daily.dbo.users_info AS u ON p.NationalCode = u.NationalCode
        WHERE 
          Start_Date LIKE '${date[0]}/%'
           AND CityName IS NOT NULL
          AND DateInfo = '${lastDateInfo}'
        GROUP BY NameFamily, u.NationalCode, CityName
        ORDER BY AVG(TotalPerformance) DESC;
      `;

      const result = await sql.query(query);
      const performanceOrder = [
        "عالی",
        "خوب",
        "متوسط",
        "ضعیف",
        "نیاز به بررسی",
      ];

      const personnel = result.recordset
        .map((a) => ({
          ...a,
          CityName: getEnglishToPersianCity(a.CityName),
          TotalPerformance: Number(a.TotalPerformance).toFixed(2),
          PerformanceText: getPerformanceText(Number(a.TotalPerformance)),
        }))
        .sort(
          (a, b) =>
            performanceOrder.indexOf(a.PerformanceText) -
            performanceOrder.indexOf(b.PerformanceText),
        );

      return personnel;
    }),
});

function generateFilterOnlySelect(filter: string[]) {
  const columns = [];
  filter.map((column) => {
    columns.push(column);
  });

  return columns.length > 0 ? `${columns.join(",")}` : "";
}

export const PersonnelPerformanceSchema = z.object({
  NameFamily: z.string(),
  NationalCode: z.string(),
  TotalPerformance: z.number(),
  CityName: z.string(),
  DateInfo: z.string(),
});

type PersonnelPerformance = z.infer<typeof PersonnelPerformanceSchema>;

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

export async function getDefualtDateInfo() {
  const query = `


  SELECT DISTINCT DateInfo FROM RAMP_Daily.dbo.users_info



  `;
  // console.log(query);
  const result = await sql.query(query);
  // console.log(result.recordsets);

  const usersInfos = result.recordsets[0].map((a) => a.DateInfo);

  const sortedDates = sortDates({ dates: usersInfos });

  return sortedDates[sortedDates.length - 1];
}
