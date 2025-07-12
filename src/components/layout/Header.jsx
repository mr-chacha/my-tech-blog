import {useZustandStore} from "@/common/store";
import {GitHubSVG, MoonSVG, SunSVG} from "@public/Icon";
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

  return (
    <HeaderContainer $isDarkMode={isDarkMode}>
      <HeaderContent>
        {/* 네비게이션 링크 */}
        <NavLinksContainer>
          <NavLink $isActive={true} onClick={() => navHandler("/")}>
            CHACHA
          </NavLink>
          <NavLink $isActive={false} onClick={() => navHandler("/about")}>
            About
          </NavLink>
        </NavLinksContainer>

        {/* 액션 버튼들 */}
        <ActionsContainer>
          {/* 다크모드 토글 */}
          <ThemeToggleButton onClick={() => setIsDarkMode(!isDarkMode)} $isDarkMode={isDarkMode}>
            <SunIcon $isDarkMode={isDarkMode}>
              <SunSVG />
            </SunIcon>
            <MoonIcon $isDarkMode={isDarkMode}>
              <MoonSVG />
            </MoonIcon>
          </ThemeToggleButton>

          {/* GitHub 링크 */}
          <GitHubButton onClick={() => navHandler("github")}>
            <GitHubSVG color={isDarkMode ? "#fff" : "#000"} />
          </GitHubButton>
        </ActionsContainer>
      </HeaderContent>

      {/* 프로그레스 바 */}
      <ProgressBarContainer>
        <ProgressBar $progress={scrollProgress} />
      </ProgressBarContainer>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.nav`
  position: fixed;
  top: 0;
  z-index: 40;
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--border-color, #e2e8f0);
  background-color: var(--background, #fff);
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  margin-top: 0;

  @media print {
    display: none;
  }

  /* 다크모드 지원 */
  ${(props) =>
    props.$isDarkMode &&
    `
    background-color: var(--background-dark, #1a1a1a);
    border-bottom-color: var(--border-color-dark, #374151);
    color: var(--foreground-dark, #fff);
  `}

  [data-theme="dark"] & {
    background-color: var(--background-dark, #1a1a1a);
    border-bottom-color: var(--border-color-dark, #374151);
    color: var(--foreground-dark, #fff);
  }

  .dark & {
    background-color: var(--background-dark, #1a1a1a);
    border-bottom-color: var(--border-color-dark, #374151);
    color: var(--foreground-dark, #fff);
  }
`;

const HeaderContent = styled.div`
  margin-top: 0.25rem;
  display: flex;
  height: 40px;
  width: 100%;
  max-width: 1200px;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;

  @media (max-width: 640px) {
    padding-bottom: 0.25rem;
  }

  @media (min-width: 640px) {
    height: 64px;
  }
`;

const NavLinksContainer = styled.div`
  display: flex;
  align-items: center;
  font-weight: 500;
`;

const NavLink = styled.a`
  border-radius: 9999px;
  padding: 0.25rem 1rem;
  text-align: center;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;

  ${(props) =>
    props.$isActive
      ? `
    background-color: var(--muted, #f1f5f9);
    color: var(--primary, #3b82f6);
  `
      : `
    color: var(--muted-foreground, #6b7280);
    
    &:hover {
      color: var(--primary, #3b82f6);
    }
  `}

  /* 다크모드 */
  [data-theme="dark"] &,
  .dark & {
    ${(props) =>
      props.$isActive
        ? `
      background-color: var(--muted-dark, #374151);
      color: var(--primary-dark, #60a5fa);
    `
        : `
      color: var(--muted-foreground-dark, #9ca3af);
      
      &:hover {
        color: var(--primary-dark, #60a5fa);
      }
    `}
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 0.75rem;
`;

// 공통 버튼 스타일
const BaseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  background: transparent;
  cursor: pointer;
  aspect-ratio: 1;
  padding: 0.5rem;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px #3b82f6;
  }

  &:hover {
    background-color: ${(props) => (props.$isDarkMode ? "#374151" : "#f1f5f9")};
    color: #0f172a;
  }

  /* 다크모드 */
  [data-theme="dark"] &,
  .dark & {
    &:hover {
      background-color: #374151;
      color: #f9fafb;
    }
  }
`;

const ThemeToggleButton = styled(BaseButton)`
  position: relative;
`;

const SunIcon = styled.div`
  height: 1.2rem;
  width: 1.2rem;
  rotate: 0deg;
  scale: 1;
  transition: all 0.3s ease;

  ${(props) =>
    props.$isDarkMode &&
    `
    rotate: -90deg;
    scale: 0;
  `}

  [data-theme="dark"] & {
    rotate: -90deg;
    scale: 0;
  }

  .dark & {
    rotate: -90deg;
    scale: 0;
  }

  svg {
    width: 100%;
    height: 100%;
  }
`;

const MoonIcon = styled.div`
  position: absolute;
  height: 1.2rem;
  width: 1.2rem;
  rotate: 90deg;
  scale: 0;
  transition: all 0.3s ease;

  ${(props) =>
    props.$isDarkMode
      ? `rotate: 0deg;
    scale: 1;`
      : `rotate: 90deg;
    scale: 0;`}

  [data-theme="dark"] & {
    rotate: 0deg;
    scale: 1;
  }

  .dark & {
    rotate: 0deg;
    scale: 1;
  }

  svg {
    width: 100%;
    height: 100%;
  }
`;

const GitHubButton = styled(BaseButton)`
  svg {
    width: 1.2rem;
    height: 1.2rem;
  }
`;

const ProgressBarContainer = styled.div`
  position: fixed;
  top: 0;
  z-index: 20;
  height: 0.25rem;
  width: 100%;
  background-color: #fff;

  [data-theme="dark"] &,
  .dark & {
    background-color: #1a1a1a;
  }
`;

const ProgressBar = styled.div`
  height: 0.25rem;
  background-color: #3b82f6;
  width: ${(props) => props.$progress * 100}%;
  transition: width 0.1s ease-out;
  will-change: width;

  [data-theme="dark"] &,
  .dark & {
    background-color: var(--primary-dark, #60a5fa);
  }
`;
