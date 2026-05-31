import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { hostname: "placehold.co", pathname: "/**" },
      { hostname: "picsum.photos", pathname: "/**" },
    ],
  },
  /** 메일/백엔드에서 경로를 복수형으로 쓰는 경우 호환 */
  async rewrites() {
    return [
      { source: "/invitations/accept", destination: "/invite/accept" },
      { source: "/invitation/accept", destination: "/invite/accept" },
    ];
  },
};

export default nextConfig;
