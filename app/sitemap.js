import { BASE_URL, getPublicPosts, timestampToDate } from "@/lib/posts";

export const revalidate = 60;

export default async function sitemap() {
  const staticRoutes = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/portfolio`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  try {
    const posts = await getPublicPosts();
    const postRoutes = posts.map((post) => ({
      url: `${BASE_URL}/post/${post.id}`,
      lastModified: timestampToDate(post.updatedAt) || timestampToDate(post.createdAt) || new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...postRoutes];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return staticRoutes;
  }
}
