import HomeClient from "./HomeClient";
import { getPostPage } from "@/lib/posts";
export const revalidate = 60;
export default async function MainPage() {
  let initialPage = { posts: [], nextCursor: null, total: 0, categories: [] };
  let initialError = false;
  try { initialPage = await getPostPage(); }
  catch (error) { initialError = true; console.error("홈 목록 조회 실패:", error.message); }
  return <HomeClient initialPage={initialPage} initialError={initialError} />;
}
