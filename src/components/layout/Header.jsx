import {useZustandStore} from "@/common/store";
import React, {useState, useEffect} from "react";
import styled from "styled-components";

export const Header = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const {isDarkMode, setIsDarkMode} = useZustandStore();

  useEffect(() => {
    let rafId;

    const updateScrollProgress = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(Math.max(scrollTop / docHeight, 0), 1);

      setScrollProgress(progress);
    };

    const handleScroll = () => {
      // requestAnimationFrame을 사용해서 부드러운 애니메이션
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(updateScrollProgress);
    };

    // passive 이벤트 리스너로 성능 최적화
    window.addEventListener("scroll", handleScroll, {passive: true});

    // 초기 상태 설정
    updateScrollProgress();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <HeaderLayout>
      <CustomProgressBar progress={scrollProgress} />
      <HeaderBox>
        <div>
          <div>CHACHA</div>
          <div>About</div>
        </div>
        <div>
          <div onClick={() => setIsDarkMode(!isDarkMode)}>{isDarkMode ? "🌙" : "🌞"}</div>
          <div>Github</div>
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
