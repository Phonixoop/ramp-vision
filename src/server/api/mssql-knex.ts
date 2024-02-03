import { TYPES } from "tedious";
import knex from "knex";
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

export const knexDB = knex({
  client: "mssql",
  connection: {
    server: process.env.SQL_SERVERIP,
    port: parseInt(process.env.SQL_PORT),
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: "RAMP_Daily",
    options: {
      mapBinding: (value) => {
        // bind all strings to varchar instead of nvarchar

        // allow devs to pass tedious type at query time
        if (value != null && value.type) {
          return {
            type: value.type,
            value: value.value,
          };
        }

        // undefined is returned; falling back to default mapping function
      },
    },
  },
});
