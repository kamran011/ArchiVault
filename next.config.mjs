/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Avoid RSC/dev overlay bugs ("segment-explorer-node" / hydration) that show as 500 in dev.
    devtoolSegmentExplorer: false,
  },
  env: {
    // Vercel: allow *_PROD fallbacks at build time so the client bundle gets pk_live.
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_PROD ||
      "",
  },
};

export default nextConfig;
