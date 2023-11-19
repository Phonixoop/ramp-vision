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
export const personnelRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        filter: z.object({
          CityName: z.array(z.string()).nullish().default([]),
          DocumentType: z.array(z.string()).nullish(),
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

        const whereClause = generateWhereClause(filter);
        const query = `SELECT DISTINCT u.CityName,u.NameFamily, ui.* FROM RAMP_Daily.dbo.users_info  as ui  
           join 
          RAMP_Daily.dbo.users as u ON u.NationalCode = ui.NationalCode

         ${whereClause}`;

        console.log(query);
        const result = await sql.query(query);
        console.log(result.recordsets[0]);
        return result.recordsets[0];
        // Respond with the fetched data
      } catch (error) {
        console.error("Error fetching data:", error.message);
        return error;
      }
    }),
  getInitialFilters: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Connect to SQL Server

      // const permissions = await getPermission({ ctx });
      // const cities = permissions
      //   .find((permission) => permission.id === "ViewCities")
      //   .subPermissions.filter((permission) => permission.isActive)
      //   .map((permission) => permission.enLabel);

      //  const whereClause = generateWhereClause({ CityName: cities });
      const query = `SELECT DISTINCT Role,RoleType,ContractType,ProjectType,DateInfo FROM RAMP_Daily.dbo.users_info

      SELECT DISTINCT CityName from RAMP_Daily.dbo.personnel_performance
      `;

      const result = await sql.query(query);
      console.log(result.recordsets);
      return {
        usersInfo: result.recordsets[0],
        Cities: result.recordsets[1],
      };
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
