import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip TypeScript type checking during builds
    ignoreBuildErrors: true,
  },
};

export default nextConfig;