import { BASE_URL } from "@/lib/posts";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/form", "/login", "/portfolio/form"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
