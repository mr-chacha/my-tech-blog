import React from "react";
import styled from "styled-components";
import {GitHubSVG} from "@public/Icon";
import {useBlogApis} from "@/common/apis";
import {useNavigate} from "react-router-dom";
import {useZustandStore} from "@/common/store";

export const LoginPage = () => {
  const navigate = useNavigate();
  const {gutHubLogin} = useBlogApis();
  const {isDarkMode, setUserInfo} = useZustandStore();

  // 깃헙 로그인
  const handleGitHubLogin = async () => {
    try {
      const result = await gutHubLogin();
      setUserInfo({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        provider: "github",
      });
      navigate("/");
    } catch (error) {
      console.error("GitHub login error:", error);
    }
  };

  return (
    <LoginLayout>
      <LoginContainer>
        <LoginSection>
          <LoginTitle>로그인</LoginTitle>

          {/* GitHub 로그인 버튼 */}
          <GitHubLoginButton type="button" onClick={handleGitHubLogin} $isDarkMode={isDarkMode}>
            <GitHubIconWrapper>
              <GitHubSVG color={isDarkMode ? "#fff" : "#000"} />
            </GitHubIconWrapper>
            GitHub로 로그인하기
          </GitHubLoginButton>

          <BackButton type="button" onClick={() => navigate("/")}>
            메인으로 돌아가기
          </BackButton>
        </LoginSection>
      </LoginContainer>
    </LoginLayout>
  );
};

const GitHubLoginButton = styled.button`
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background-color: ${(props) => (props.$isDarkMode ? "#24292e" : "#f6f8fa")};
  color: ${(props) => (props.$isDarkMode ? "#fff" : "#24292e")};
  font: var(--Body-B);
  border: 2px solid ${(props) => (props.$isDarkMode ? "#30363d" : "#d0d7de")};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 1.5rem;

  &:hover:not(:disabled) {
    background-color: ${(props) => (props.$isDarkMode ? "#30363d" : "#f3f4f6")};
    border-color: ${(props) => (props.$isDarkMode ? "#484f58" : "#9ca3af")};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  &:active {
    transform: translateY(0);
  }
`;

const GitHubIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;

  svg {
    width: 100%;
    height: 100%;
  }
`;

const LoginLayout = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--Back-Color);
  padding: 2rem 1rem;
`;

const LoginContainer = styled.div`
  width: 100%;
  max-width: 400px;
`;

const LoginSection = styled.div`
  background-color: var(--Back-Color);
  border: 1px solid var(--Border-Color);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);

  @media (max-width: 480px) {
    padding: 1.5rem;
  }
`;

const LoginTitle = styled.h1`
  font: var(--Large-Title);
  color: var(--Text-Color);
  text-align: center;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  width: 100%;
  height: 40px;
  margin-top: 1rem;
  background-color: transparent;
  color: var(--Text-Color);
  font: var(--Body-R);
  border: 1px solid var(--Border-Color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--Brand-Colors-Two);
    border-color: var(--Brand-Colors);
  }
`;
