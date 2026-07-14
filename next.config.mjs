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

  // Skip TypeScript checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default config;
