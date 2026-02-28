import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /.*/, // all HTML
        handler: "NetworkFirst", // try network first, fallback to cache
        options: { cacheName: "html-cache" },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      }
    ],
  },
  
  // @ts-ignore - To silence Turbopack error when using webpack plugins
  turbopack: {
    root: '.',
  },
};

export default withPWA(nextConfig);
