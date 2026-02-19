import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  
  // Image optimization
  images: {
    domains: ['localhost'],
  },
};

export default nextConfig;
