function resolveClerkPublishableForBuild() {
  return (
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_PROD?.trim() ||
    ""
  )
}

function resolveClerkSecretForBuild() {
  return (
    process.env.CLERK_SECRET_KEY?.trim() ||
    process.env.CLERK_SECRET_KEY_PROD?.trim() ||
    ""
  )
}

if (process.env.VERCEL_ENV === "production") {
  const pk = resolveClerkPublishableForBuild()
  const sk = resolveClerkSecretForBuild()
  if (!pk || !sk) {
    throw new Error(
      "[archivolt] Production build blocked: set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in Vercel → Environment Variables → Production (pk_live / sk_live), then redeploy.",
    )
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Avoid RSC/dev overlay bugs ("segment-explorer-node" / hydration) that show as 500 in dev.
    devtoolSegmentExplorer: false,
  },
  env: {
    // Vercel: allow *_PROD fallbacks at build time so the client bundle gets pk_live.
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: resolveClerkPublishableForBuild(),
  },
  webpack(config, { dev }) {
    if (dev) {
      // Filesystem pack cache on Windows often goes stale when .next is deleted mid-dev
      // (MODULE_NOT_FOUND ./NNNN.js → GET /dashboard 500). Memory cache avoids that.
      config.cache = { type: "memory" }
    }
    return config
  },
};

export default nextConfig;
