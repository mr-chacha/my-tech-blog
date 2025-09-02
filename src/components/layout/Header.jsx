import {useZustandStore} from "@/common/store";
import {GlobalText} from "@/common/style";
import {GitHubSVG, MoonSVG, SunSVG} from "@public/Icon";
import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import styled from "styled-components";
import {signOut} from "firebase/auth";
import {auth} from "@/server/firebase";

export const Header = () => {
  const {userInfo, setUserInfo, isDarkMode, setIsDarkMode} = useZustandStore();

  const [scrollProgress, setScrollProgress] = useState(0);
  const [headerMenu, setHeaderMenu] = useState("list");
  const navigate = useNavigate();

  const navHandler = (path, value) => {
    setHeaderMenu(value);
    if (path === "github") {
      window.open("https://github.com/mr-chacha", "_blank");
    } else {
      navigate(path);
    }
  };

  const handleThemeToggle = () => {
    localStorage.setItem("isDarkMode", !isDarkMode);
    setIsDarkMode(!isDarkMode);
  };

  // 로그아웃 API
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUserInfo(null);
      navigate("/");
    } catch (error) {
      console.error("로그아웃 오류:", error);
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
          <NavTitle
            className="header-title"
            $isDarkMode={isDarkMode}
            $isActive={headerMenu === "list"}
            onClick={(e) => {
              e.preventDefault();
              navHandler("/", "list");
            }}
          >
            CHACHA
          </NavTitle>
          <NavTitle
            className="header-title"
            font="var(--Body-M)"
            $isActive={headerMenu === "about"}
            onClick={(e) => {
              e.preventDefault();
              navHandler("/about", "about");
            }}
          >
            About
          </NavTitle>
          <NavTitle
            className="header-title"
            font="var(--Body-M)"
            $isActive={headerMenu === "login"}
            onClick={(e) => {
              e.preventDefault();
              navHandler("/login", "login");
            }}
          >
            Login
          </NavTitle>
          {userInfo && (
            <NavTitle
              className="header-title"
              font="var(--Body-M)"
              $isActive={headerMenu === "post"}
              onClick={(e) => {
                e.preventDefault();
                navHandler("/form", "post");
              }}
            >
              Post
            </NavTitle>
          )}
          {userInfo && (
            <GlobalText className="header-title" font="var(--Body-M)" onClick={handleSignOut}>
              Logout
            </GlobalText>
          )}
        </NavLinksContainer>

        {/* 액션 버튼들 */}
        <ActionsContainer>
          {/* 다크모드 토글 */}
          <ThemeToggleButton onClick={handleThemeToggle} $isDarkMode={isDarkMode}>
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
  border-bottom: 1px solid var(--Border-Color);
  background-color: var(--Back-Color);
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  margin-top: 0;
  top: 0;

  @media print {
    display: none;
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
  gap: 10px;

  .header-title {
    cursor: pointer;
  }
`;

const NavTitle = styled.div`
  font: var(--Body-B);
  border-radius: 9999px;
  padding: 0.25rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: pointer;

  color: var(--Text-Color);

  ${(props) =>
    props.$isActive &&
    `
    background-color: #f1f5f9;
    color: #3b82f6;

    
  `}
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
