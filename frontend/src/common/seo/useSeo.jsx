import {useEffect} from "react";

export const useSEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = "article",
  publishedTime,
  modifiedTime,
  author = "차차",
}) => {
  useEffect(() => {
    if (!title && type === "article") return;

    if (title) {
      document.title = `${title} | 차차의 개발블로그`;
    }

    // 기존 메타 태그 제거 함수
    const removeExistingMeta = (property, attribute = "name") => {
      const existing = document.querySelector(`meta[${attribute}="${property}"]`);
      if (existing) existing.remove();
    };

    // 메타 태그 생성 함수
    const createMeta = (property, content, attribute = "name") => {
      if (!content) return;

      removeExistingMeta(property, attribute);
      const meta = document.createElement("meta");
      meta.setAttribute(attribute, property);
      meta.setAttribute("content", content);
      document.head.appendChild(meta);
    };

    // 기본 메타 태그들
    createMeta("description", description);
    createMeta("keywords", keywords);
    createMeta("author", author);

    // Open Graph 메타 태그들
    createMeta("og:title", title, "property");
    createMeta("og:description", description, "property");
    createMeta("og:type", type, "property");
    createMeta("og:url", url, "property");
    createMeta("og:image", image, "property");

    // Article 타입인 경우 추가 메타 태그
    if (type === "article") {
      createMeta("article:author", author, "property");
      createMeta("article:published_time", publishedTime, "property");
      createMeta("article:modified_time", modifiedTime, "property");
    }

    // Twitter Card
    createMeta("twitter:card", "summary_large_image");
    createMeta("twitter:title", title);
    createMeta("twitter:description", description);
    createMeta("twitter:image", image);

    // Canonical URL 설정
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    if (url) canonical.href = url;

    // 구조화 데이터 (JSON-LD) 추가
    if (type === "article" && title && description) {
      // 기존 구조화 데이터 제거
      const existingScript = document.querySelector('script[type="application/ld+json"]#article-schema');
      if (existingScript) existingScript.remove();

      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "article-schema";
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": title,
        "description": description,
        "image": image,
        "url": url,
        "datePublished": publishedTime,
        "dateModified": modifiedTime || publishedTime,
        "author": {
          "@type": "Person",
          "name": author,
        },
        "publisher": {
          "@type": "Person",
          "name": author,
        },
      });
      document.head.appendChild(script);
    }
  }, [title, description, keywords, image, url, type, publishedTime, modifiedTime, author]);
};

// SEO 관련 유틸리티 함수들
export const generateSEOKeywords = (category, tags = []) => {
  const baseKeywords = ["개발블로그", "프론트엔드", "웹개발", "차차"];
  const categoryKeywords = category ? [category] : [];
  return [...baseKeywords, ...categoryKeywords, ...tags].join(", ");
};

export const truncateDescription = (content, maxLength = 160) => {
  if (!content) return "";
  const plainText = content.replace(/[#*`_~\[\]()]/g, "").replace(/\n/g, " ");
  return plainText.length > maxLength ? plainText.substring(0, maxLength - 3) + "..." : plainText;
};

export const getCurrentURL = () => {
  return typeof window !== "undefined" ? window.location.href : "";
};
