import HomeClient from "./HomeClient";
import { getPublicPosts } from "@/lib/posts";

export const revalidate = 60;

export default async function MainPage() {
  let recentPostLists = [];
  let postLists = [];

  try {
    const allPosts = await getPublicPosts({ includeContent: false });
    if (allPosts.length > 5) {
      recentPostLists = allPosts.slice(0, 5);
      postLists = allPosts.slice(5);
    } else {
      recentPostLists = allPosts;
      postLists = [];
    }
  } catch (error) {
    console.error("홈 포스트 조회 실패:", error);
  }

  return <HomeClient initialRecentPosts={recentPostLists} initialPostLists={postLists} />;
}
