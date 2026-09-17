import { BASE_URL } from "@/lib/posts";

export const metadata = {
  title: "Portfolio | 차차의 개발블로그",
  description: "차차가 만든 웹·앱 포트폴리오를 소개합니다.",
  alternates: {
    canonical: `${BASE_URL}/portfolio`,
  },
  openGraph: {
    type: "website",
    title: "Portfolio | 차차의 개발블로그",
    description: "차차가 만든 웹·앱 포트폴리오를 소개합니다.",
    url: `${BASE_URL}/portfolio`,
    images: [{ url: `${BASE_URL}/chacha-dev.png` }],
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio | 차차의 개발블로그",
    description: "차차가 만든 웹·앱 포트폴리오를 소개합니다.",
    images: [`${BASE_URL}/chacha-dev.png`],
  },
};

export default function PortfolioLayout({ children }) {
  return children;
}
