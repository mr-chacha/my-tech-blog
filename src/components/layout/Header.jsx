import {useZustandStore} from "@/common/store";
import {GlobalText} from "@/common/style";
import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import styled from "styled-components";

export const Header = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const {isDarkMode, setIsDarkMode} = useZustandStore();
  const navigate = useNavigate();
  const navHandler = (path) => {
    if (path === "github") {
      window.open("https://github.com/mr-chacha", "_blank");
    } else {
      navigate(path);
    }
  };

  // 상단 스크롤바 위치에 따른 프로그래스바
  useEffect(() => {
    let rafId;
    const updateScrollProgress = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(Math.max(scrollTop / docHeight, 0), 1);

      setScrollProgress(progress);
    };

    const handleScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(updateScrollProgress);
    };
    window.addEventListener("scroll", handleScroll, {passive: true});
    updateScrollProgress();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  console.log("isDarkMode", isDarkMode);

  return (
    <HeaderLayout>
      <CustomProgressBar progress={scrollProgress} />
      <HeaderBox $isDarkMode={isDarkMode}>
        <div className="header-box">
          <GlobalText onClick={() => navHandler("/")} className="nav-link chacha-link">
            CHACHA
          </GlobalText>
          <GlobalText onClick={() => navHandler("/about")} className="nav-link">
            About Me
          </GlobalText>
        </div>
        <div className="header-box">
          <div className="nav-link" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? "🌙" : "🌞"}
          </div>
          <div className="nav-link" onClick={() => navHandler("github")}>
            Github
          </div>
        </div>
      </HeaderBox>
    </HeaderLayout>
  );
};

const HeaderBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  .header-box {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .nav-link {
    cursor: pointer;
  }
  .chacha-link {
    padding: 5px;
    border-radius: 10px;
    background-color: ${(props) => (props.$isDarkMode ? "lightgray" : "var(--Border-Color)")};
    color: ${(props) => (props.$isDarkMode ? "#000" : "#fff")};
  }
`;

const CustomProgressBar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  height: 4px;
  width: ${(props) => props.progress * 100}%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.3);
  transition: width 0.1s ease-out;
  will-change: width;
`;

const HeaderLayout = styled.nav`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: color;
  margin-top: 0px;
  height: 60px;

  position: fixed;
  top: 0;
  border-bottom: 1px solid var(--Border-Color);
  padding: 0px 20px;
`;
