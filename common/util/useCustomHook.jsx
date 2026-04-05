"use client";
import { useRouter } from "next/navigation";

// react-router-dom의 useNavigate를 Next.js router로 대체
export const useCustomNav = () => {
  const router = useRouter();
  return (path) => router.push(path);
};

export const formatTimestamp = (timestamp) => {
  if (!timestamp) return "날짜 없음";

  // Firestore Timestamp 객체 처리
  if (timestamp.toDate) {
    const date = timestamp.toDate();
    const koreanDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    return koreanDate
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\./g, "-")
      .replace(/ /g, "")
      .slice(0, -1);
  }

  // Firestore Timestamp가 직렬화된 경우 (_seconds 속성)
  if (timestamp._seconds) {
    const date = new Date(timestamp._seconds * 1000);
    const koreanDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    return koreanDate
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\./g, "-")
      .replace(/ /g, "")
      .slice(0, -1);
  }

  return "날짜 없음";
};
