import path from "path";

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
  // typedRoutes: true,
  // i18n configuration is not supported with App Router
  // Use middleware.ts for internationalization instead

  // Enable standalone output for Docker
  output: "standalone",

  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Exclude pages1 folder from webpack compilation
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      exclude: /src\/pages1/,
    });

    return config;
  },

  // Exclude pages1 from page generation
  pageExtensions: ["tsx", "ts", "jsx", "js"].filter((ext) => {
    // This will prevent Next.js from looking for pages in the pages1 directory
    return true;
  }),
};

export default config;
