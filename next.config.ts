import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  
  // Image optimization
  images: {
    domains: ['localhost'],
  },
  
  experimental: {
    // @ts-ignore - To silence Turbopack error when using webpack plugins
    turbopack: {},
  },
};

export default withPWA(nextConfig);
