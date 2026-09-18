/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  /**
   * Amplify Hosting(Next SSR/API)은 빌드 시점 env는 있으나
   * 요청 시점 Lambda/SSR 런타임에 서버 시크릿이 비는 경우가 있습니다.
   * next.config env는 빌드 시 서버 번들에 값을 주입해 API/SSR이 동작하게 합니다.
   *
   * 주의:
   * - NEXT_PUBLIC_ 접두사는 쓰지 말 것
   * - 클라이언트 코드에서 아래 키를 process.env로 참조하지 말 것
   * - 배포 후 .next/static 에 "BEGIN PRIVATE KEY" 문자열이 없는지 확인
   */
  env: {
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
    FIREBASE_PRIVATE_KEY_BASE64: process.env.FIREBASE_PRIVATE_KEY_BASE64,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
    S3_REGION: process.env.S3_REGION,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
  },
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
