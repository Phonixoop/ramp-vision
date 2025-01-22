// // db.js
// import sql from "mssql";

// const config = {
//   user: process.env.SQL_USER,
//   password: process.env.SQL_PASSWORD,
//   server: process.env.SQL_SERVERIP,
//   port: parseInt(process.env.SQL_PORT),
//   database: "RAMP_OTP", // Set your database name, e.g., "RAMP_Daily" or "RAMP_Weekly"
//   options: {
//     encrypt: true, // For securing the connection (optional, based on your setup)
//     trustServerCertificate: true, // For self-signed certificates (optional, based on your setup)
//   },
// };

// let pool;

// const connectToDB = async () => {
//   if (!pool) {
//     try {
//       pool = await new sql.ConnectionPool(config).connect();
//       console.log("Database RAMP_OTP connected.");
//     } catch (err) {
//       console.error("Database RAMP_OTP connection failed:", err);
//       throw err;
//     }
//   }
//   return pool;
// };

// // Connect to the database once when the app starts
// connectToDB()
//   .then(() => {
//     console.log("App RAMP_OTP is connected to the database.");
//   })
//   .catch((err) => {
//     console.error("Failed RAMP_OTP to connect to the database:", err);
//     process.exit(1); // Exit the app if the database connection fails
//   });

// // Export the sql object (for direct access) and pool (for queries)
// export { sql as dbRampOTP };
