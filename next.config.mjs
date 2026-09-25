/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/pinecone/:path*',
        destination: 'https://sahityaka-memory-wwrrfo8.svc.aped-4627-b74a.pinecone.io/:path*',
      },
    ]
  },
}

export default nextConfig;
