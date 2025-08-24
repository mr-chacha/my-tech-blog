import {useNavigate} from "react-router-dom";

export const useCustomNav = () => {
  const nav = useNavigate();
  return (path) => nav(path);
};
export const formatTimestamp = (timestamp) => {
  if (!timestamp || !timestamp.toDate) {
    return "날짜 없음";
  }

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
};
