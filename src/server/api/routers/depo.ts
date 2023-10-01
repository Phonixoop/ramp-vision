import { z } from "zod";

import sql from "mssql";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

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
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        // Connect to SQL Server
        await sql.connect(config);

        // Query to retrieve data from a table (replace with your own query)
        const result = await sql.query`
        

        SELECT DIStinct * FROM RAMP_Daily.dbo.depos 
        WHERE CityName is not null and Start_Date = '1402/05/25' and CityName = 'Alborz'
        ORDER BY CityName 
        
    
        `;
        console.log(result.recordsets[0]);
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
