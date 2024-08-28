import { fileURLToPath } from "url";
import createJiti from "jiti";

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
createJiti(fileURLToPath(import.meta.url))("./src/env");

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "jamarski-klub-novo-mesto.s3.eu-central-1.amazonaws.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "jknm.s3.eu-central-1.amazonaws.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "www.jknm.si",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "lh3.google.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "jknm-turborepo.vercel.app",
        port: "",
        pathname: "**",
      },
    ],
  },

  experimental: {
    reactCompiler: true,
    serverActions: {
      // TODO
      bodySizeLimit: "100mb",
    },
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },

  reactStrictMode: true,

  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@acme/api",
    "@acme/auth",
    "@acme/db",
    "@acme/ui",
    "@acme/validators",
  ],

  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default config;
