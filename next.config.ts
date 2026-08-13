import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@libsql/client", "bcryptjs"],
  experimental: {
    authInterrupts: true,
  },
};

export default nextConfig;
