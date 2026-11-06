"use client";
import { formatPostDate } from "./post-data.mjs";
import { useRouter } from "next/navigation";

// react-router-dom의 useNavigate를 Next.js router로 대체
export const useCustomNav = () => {
  const router = useRouter();
  return (path) => router.push(path);
};

export const formatTimestamp = (timestamp) => formatPostDate(timestamp, true);
