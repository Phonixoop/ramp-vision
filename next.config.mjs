/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
// Skip environment validation during Docker builds
if (process.env.BUILD_ENV === "docker" || process.env.DOCKER_BUILD === "true") {
  process.env.SKIP_ENV_VALIDATION = "true";
}

await import("./src/env.mjs");

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  allowedDevOrigins: ["192.168.0.211"],

  // Keep native SQL drivers out of the Turbopack/webpack server bundle.
  // Bundling them hits a Buffer.SlowBuffer polyfill crash at build time.
  serverExternalPackages: ["mssql", "tedious", "tarn", "@azure/identity"],

  // Skip TypeScript checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default config;
