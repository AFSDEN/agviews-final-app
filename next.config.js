/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // This tells Vercel to completely ignore strict type crashes and build anyway!
    ignoreBuildErrors: true,
  },
  eslint: {
    // This stops lint errors from blocking your deployment!
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
