import {useNavigate} from "react-router-dom";

export const useCustomNav = () => {
  const nav = useNavigate();
  return (path) => nav(path);
};
