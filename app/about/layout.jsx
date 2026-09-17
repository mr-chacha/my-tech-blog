import { BASE_URL } from "@/lib/posts";

export const metadata = {
  title: "About | 차차의 개발블로그",
  description: "프론트엔드 개발자 차상현의 소개, 경력, 기술 스택을 확인하세요.",
  alternates: {
    canonical: `${BASE_URL}/about`,
  },
  openGraph: {
    type: "profile",
    title: "About | 차차의 개발블로그",
    description: "프론트엔드 개발자 차상현의 소개, 경력, 기술 스택",
    url: `${BASE_URL}/about`,
    images: [{ url: `${BASE_URL}/chacha-dev.png` }],
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "About | 차차의 개발블로그",
    description: "프론트엔드 개발자 차상현의 소개, 경력, 기술 스택",
    images: [`${BASE_URL}/chacha-dev.png`],
  },
};

export default function AboutLayout({ children }) {
  return children;
}
