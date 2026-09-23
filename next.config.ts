import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    EDUCORE_BACKEND_API: process.env.EDUCORE_BACKEND_API,
  },
};

export default nextConfig;
