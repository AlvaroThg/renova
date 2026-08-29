/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @renova/shared se consume como TypeScript compilado desde el workspace.
  transpilePackages: ['@renova/shared'],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  },
};

export default nextConfig;
