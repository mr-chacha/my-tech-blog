import StyledComponentsRegistry from "@/components/StyledComponentsRegistry";
import AppLayout from "@/components/AppLayout";

export const metadata = {
  title: "차차의 개발블로그 | 완벽한 개발자를 꿈꾸는 프론트엔드 개발자",
  description: "프론트엔드 개발자 차차의 기술 블로그입니다.",
  keywords: "React, JavaScript, TypeScript, CSS, 프론트엔드, 개발블로그, 웹개발, 차차",
  authors: [{ name: "차차" }],
  openGraph: {
    type: "website",
    title: "차차의 개발블로그",
    description: "프론트엔드 개발자 차차의 기술 블로그입니다.",
    url: "https://chacha-dev.com/",
    images: [{ url: "https://chacha-dev.com/chacha-dev.png" }],
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "차차의 개발블로그",
    description: "프론트엔드 개발자의 기술 블로그",
    images: ["https://chacha-dev.com/chacha-dev.png"],
  },
  verification: {
    google: "g3aC7qUpJtT_CR3FI1Lju3CgtQM0-vTSpvCLQoynw_c",
    other: {
      "naver-site-verification": "7043f41fb1967019750200e9b409e4eeebea33f6",
    },
  },
  alternates: {
    canonical: "https://chacha-dev.com/",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Blog",
              name: "차차의 개발블로그",
              description: "프론트엔드 개발자 차차의 기술 블로그",
              url: "https://chacha-dev.com/",
              author: {
                "@type": "Person",
                name: "차차",
              },
              publisher: {
                "@type": "Person",
                name: "차차",
              },
            }),
          }}
        />
      </head>
      <body>
        <StyledComponentsRegistry>
          <AppLayout>{children}</AppLayout>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
