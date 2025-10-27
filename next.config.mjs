/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Use default output (server) so API routes run on Netlify functions
  images: {
    unoptimized: true
  }
};

export default nextConfig;



