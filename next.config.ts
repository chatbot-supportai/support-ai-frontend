import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Prevent stale build-trace artifacts for the auto-generated favicon
  // metadata route from causing ENOENT errors on app-paths-manifest.json.
  // Next.js App Router automatically turns app/favicon.ico into a metadata
  // route handler at app/favicon.ico/[__metadata_id__]/route — excluding it
  // from output file tracing avoids stale manifest references surviving a
  // cache invalidation.
  outputFileTracingExcludes: {
    "*": [
      "./**/.next/server/app/favicon.ico/**",
    ],
  },

  // Ensure TypeScript errors don't silently suppress build failures
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
