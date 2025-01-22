import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import { generateWhereClause, getPermission } from "~/server/server-utils";
import { getEnglishToPersianCity } from "~/utils/util";
import { extractYearAndMonth } from "~/utils/date-utils";
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
export const insuranceMetricsRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        // limit: z.number().min(1).max(100).nullish().default(10),
        // cursor: z.string().nullish(),

        filter: z.object({
          CityName: z.array(z.string()).nullish().default([]),

          Start_Date: z.array(z.string()).min(1).max(10),
        }),
      }),
    )
    .query(async ({ input, ctx }) => {
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

      let query = "SELECT * FROM RAMP_Daily.dbo.insurance_metrics ";

      let dates = filter.Start_Date.map((d) => {
        const _d = d.split("/");

        return `LIKE '${_d[0]}/${_d[1]}/%'`;
      });
      let whereClause = generateWhereClause(filter, ["Start_Date"], undefined);

      whereClause += ` AND (Start_Date ${dates.join(
        " OR Start_Date ",
      )}) Order By CityName `;
      query += whereClause;

      const result = await sql.query(query);

      return result.recordset.map((r) => {
        return {
          ...r,
          CityName: getEnglishToPersianCity(r.CityName),
        };
      });
    }),
  getInitialCities: protectedProcedure.query(async ({ ctx }) => {
    const permissions = await getPermission({ ctx });
    const cities = permissions
      .find((permission) => permission.id === "ViewCities")
      .subPermissions.filter((permission) => permission.isActive)
      .map((permission) => permission.enLabel);

    const whereClauseForCity = generateWhereClause({
      CityName: cities,
    });

    const query = `
  
    
    SELECT DISTINCT CityName from RAMP_Daily.dbo.insurance_metrics
    ${whereClauseForCity}
  
  
  
    `;
    // console.log(query);
    const result = await sql.query(query);
    // console.log(result.recordsets);
    return {
      Cities: result.recordsets[0]
        .filter((c) => c.CityName !== "")
        .map((c) => {
          return {
            CityName: getEnglishToPersianCity(c.CityName),
          };
        }),
    };
  }),
  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
