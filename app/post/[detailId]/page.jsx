import { getDb } from "@/lib/firebase-admin";
import dynamic from "next/dynamic";

const DetailClient = dynamic(() => import("./DetailClient"), { ssr: false });

const BASE_URL = "https://chacha-dev.com";
const DEFAULT_IMAGE = `${BASE_URL}/chacha-dev.png`;

async function getPost(detailId) {
  try {
    const doc = await getDb().collection("posts").doc(detailId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  } catch {
    return null;
  }
}

function getTimestamp(ts) {
  if (!ts) return undefined;
  if (ts._seconds) return new Date(ts._seconds * 1000).toISOString();
  if (ts.toDate) return ts.toDate().toISOString();
  if (ts.seconds) return new Date(ts.seconds * 1000).toISOString();
  if (ts instanceof Date) return ts.toISOString();
  return undefined;
}

function truncate(text, max = 160) {
  if (!text) return "";
  const plain = text.replace(/[#*`_~\[\]()!]/g, "").replace(/\n/g, " ").trim();
  return plain.length > max ? plain.slice(0, max - 3) + "..." : plain;
}

export async function generateMetadata({ params }) {
  const post = await getPost(params.detailId);

  if (!post) {
    return {
      title: "포스트를 찾을 수 없습니다 | 차차의 개발블로그",
      description: "요청하신 포스트를 찾을 수 없습니다.",
    };
  }

  const title = post.title || "차차의 개발블로그";
  const description = truncate(post.content);
  const image = post.image || post.bestImage || DEFAULT_IMAGE;
  const url = `${BASE_URL}/post/${params.detailId}`;
  const publishedTime = getTimestamp(post.createdAt);
  const modifiedTime = getTimestamp(post.updatedAt);

  return {
    title: `${title} | 차차의 개발블로그`,
    description,
    keywords: [
      "개발블로그", "프론트엔드", "웹개발", "차차",
      post.category, ...(post.tags || []),
    ].filter(Boolean).join(", "),
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

export default function DetailPage() {
  return <DetailClient />;
}
