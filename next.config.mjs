/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: export temporarily to support dynamic admin routes
  // For production, consider using output: export only for public pages
  // and deploying admin as a separate app or using server-side rendering
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    esmExternals: true,
  },
};

export default nextConfig;
