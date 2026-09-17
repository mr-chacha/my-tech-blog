import DetailClient from "./DetailClient";
import {
  BASE_URL,
  DEFAULT_IMAGE,
  getPostById,
  isPublicPost,
  timestampToDate,
  truncateDescription,
} from "@/lib/posts";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const post = await getPostById(params.detailId);

  if (!post) {
    return {
      title: "포스트를 찾을 수 없습니다 | 차차의 개발블로그",
      description: "요청하신 포스트를 찾을 수 없습니다.",
      robots: { index: false, follow: false },
    };
  }

  const title = post.title || "차차의 개발블로그";
  const description = truncateDescription(post.content) || "프론트엔드 개발자 차차의 기술 블로그입니다.";
  const image = post.image || post.bestImage || DEFAULT_IMAGE;
  const url = `${BASE_URL}/post/${params.detailId}`;
  const publishedTime = timestampToDate(post.createdAt)?.toISOString();
  const modifiedTime = timestampToDate(post.updatedAt)?.toISOString();
  const publicPost = isPublicPost(post);

  return {
    title: `${title} | 차차의 개발블로그`,
    description,
    robots: publicPost ? { index: true, follow: true } : { index: false, follow: false },
    keywords: ["개발블로그", "프론트엔드", "웹개발", "차차", post.category, ...(post.tags || [])]
      .filter(Boolean)
      .join(", "),
    authors: [{ name: "차차" }],
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: "차차의 개발블로그",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "ko_KR",
      publishedTime,
      modifiedTime,
      authors: ["차차"],
      tags: post.tags || [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function DetailPage({ params }) {
  const post = await getPostById(params.detailId);

  if (!post) {
    return <DetailClient initialPost={null} />;
  }

  const url = `${BASE_URL}/post/${params.detailId}`;
  const image = post.image || post.bestImage || DEFAULT_IMAGE;
  const description = truncateDescription(post.content) || post.title;
  const publishedTime = timestampToDate(post.createdAt)?.toISOString();
  const modifiedTime = timestampToDate(post.updatedAt)?.toISOString();

  const jsonLd = isPublicPost(post)
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description,
        image,
        url,
        datePublished: publishedTime,
        dateModified: modifiedTime || publishedTime,
        author: {
          "@type": "Person",
          name: post.author || "차차",
        },
        publisher: {
          "@type": "Person",
          name: "차차",
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": url,
        },
        keywords: [post.category, ...(post.tags || [])].filter(Boolean).join(", "),
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <DetailClient initialPost={post} />
    </>
  );
}
