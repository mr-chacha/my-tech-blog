/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  // 서버 비밀키는 next.config env에 넣지 마세요.
  // NEXT_PUBLIC_ 없는 변수는 서버(Route Handler / Server Component)의 process.env로만 읽습니다.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "chacha-dev.com",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["firebase-admin"],
  },
};

module.exports = nextConfig;
