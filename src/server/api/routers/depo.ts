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

export const depoRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish().default(10),
        cursor: z.string().nullish(),
        filter: z.object({
          ServiceName: z.array(z.string()).nullish(),
          CityName: z.array(z.string()).nullish().default(["Alborz"]),
          DocumentType: z.array(z.string()).nullish(),
          Start_Date: z
            .array(z.string())
            .nullish()
            .default([
              moment().locale("fa").subtract(2, "days").format("YYYY/MM/DD"),
              moment().locale("fa").subtract(5, "days").format("YYYY/MM/DD"),
              moment().locale("fa").subtract(6, "days").format("YYYY/MM/DD"),
            ]),
        }),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        // Connect to SQL Server
        await sql.connect(config);

        const queryParams = [];
        const conditions = [];
        const filter = input.filter;

        const whereClause = generateWhereClause(filter);

        // Query to retrieve data from a table (replace with your own query)
        // const result = await sql.query`

        // SELECT DIStinct * FROM RAMP_Daily.dbo.depos
        // WHERE CityName is not null and Start_Date = '1402/05/25' and CityName = 'Alborz'
        // ORDER BY CityName

        // `;
        // const filters = await sql.query(
        //   `SELECT DISTINCT ServiceName,CityName,DocumentType,Start_Date FROM RAMP_Daily.dbo.depos`,
        // );

        // console.log(
        //   `SELECT DISTINCT ${generateFilterOnlySelect([
        //     "ServiceName",
        //     "CityName",
        //     "DocumentType",
        //     "Start_Date",
        //   ])} FROM RAMP_Daily.dbo.depos`,
        // );
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
      } finally {
        // Close the SQL Server connection
        await sql.close();
      }
    }),
});

function generateWhereClause(filter) {
  const conditions = [];

  for (const key in filter) {
    const value = filter[key];
    if (Array.isArray(value)) {
      // If the value is an array, create a condition with IN operator
      const condition = `${key} IN ('${value.join("','")}')`;
      conditions.push(condition);
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
