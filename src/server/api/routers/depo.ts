import { z } from "zod";

import sql from "mssql";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import moment from "jalali-moment";

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
        filter: z.object({
          ServiceName: z.array(z.string()).nullish(),
          CityName: z.array(z.string()).nullish(),
          DocumentType: z.array(z.string()).nullish(),
          Start_Date: z
            .array(z.string())
            .min(1)
            .max(10)
            .default([
              moment().locale("fa").subtract(2, "days").format("YYYY/MM/DD"),
            ]),
        }),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        // Connect to SQL Server
        const filter = input.filter;

        const whereClause = generateWhereClause(filter);

        const query = `SELECT DISTINCT * FROM RAMP_Daily.dbo.depos 
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
      console.log(queryCities);
      const resultOfCities = await sql.query(queryCities);

      // const queryDocumentTypes = `SELECT DISTINCT DocumentType FROM RAMP_Daily.dbo.depos`;
      // console.log(queryDocumentTypes);
      // const resultOfDocumentTypes = await sql.query(queryDocumentTypes);

      const result = {
        Cities: resultOfCities.recordsets[0].filter((c) => c.CityName !== ""),
      };
      console.log(result);
      return result;
      // Respond with the fetched data
    } catch (error) {
      console.error("Error fetching data:", error.message);
      return error;
    }
  }),
});

function generateWhereClause(filter) {
  const conditions = [];

  for (const key in filter) {
    const value = filter[key];
    if (Array.isArray(value)) {
      // If the value is an array, create a condition with IN operator
      const newValue = [];
      value.forEach((v) => {
        newValue.push(`N'${v}'`);
      });
      const condition = `${key} IN (${newValue.join(",")})`;
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