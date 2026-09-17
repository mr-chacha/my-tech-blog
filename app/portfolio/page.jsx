import PortfolioClient from "./PortfolioClient";
import { getPortfolioItems } from "@/lib/posts";

export const revalidate = 60;

export default async function PortfolioPage() {
  let items = [];

  try {
    items = await getPortfolioItems();
  } catch (error) {
    console.error("포트폴리오 서버 조회 실패:", error);
  }

  return <PortfolioClient initialItems={items} />;
}
