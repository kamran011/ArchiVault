/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Avoid RSC/dev overlay bugs ("segment-explorer-node" / hydration) that show as 500 in dev.
    devtoolSegmentExplorer: false,
  },
};

export default nextConfig;
