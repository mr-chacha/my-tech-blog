import {useZustandStore} from "@/common/store";
import {auth} from "@/server/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GithubAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import styled from "styled-components";

export const LoginPage = () => {
  const {isDarkMode} = useZustandStore();
  const navigate = useNavigate();
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loginChange = (e) => {
    setLoginInfo({...loginInfo, [e.target.name]: e.target.value});
    setError(""); // 입력 시 에러 메시지 초기화
  };

  const handleGitHubLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);
      alert("GitHub 로그인 성공!");
      navigate("/");
    } catch (error) {
      console.error("GitHub login error:", error);
      switch (error.code) {
        case "auth/account-exists-with-different-credential":
          setError("이미 다른 방법으로 가입된 이메일입니다.");
          break;
        case "auth/cancelled-popup-request":
          setError("로그인이 취소되었습니다.");
          break;
        case "auth/popup-blocked":
          setError("팝업이 차단되었습니다. 팝업을 허용해주세요.");
          break;
        default:
          setError("GitHub 로그인 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginInfo.email || !loginInfo.password) {
      setError("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, loginInfo.email, loginInfo.password);
        alert("회원가입이 완료되었습니다!");
      } else {
        await signInWithEmailAndPassword(auth, loginInfo.email, loginInfo.password);
        alert("로그인 성공!");
        navigate("/");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      switch (error.code) {
        case "auth/user-not-found":
          setError("등록되지 않은 이메일입니다.");
          break;
        case "auth/wrong-password":
          setError("비밀번호가 올바르지 않습니다.");
          break;
        case "auth/email-already-in-use":
          setError("이미 사용 중인 이메일입니다.");
          break;
        case "auth/weak-password":
          setError("비밀번호는 6자 이상이어야 합니다.");
          break;
        case "auth/invalid-email":
          setError("올바른 이메일 형식을 입력해주세요.");
          break;
        default:
          setError("오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginLayout>
      <LoginContainer>
        <LoginSection>
          <LoginTitle>{isSignUp ? "회원가입" : "로그인"}</LoginTitle>

          <LoginForm onSubmit={handleSubmit}>
            <InputGroup>
              <LoginInput
                name="email"
                type="email"
                placeholder="이메일을 입력하세요"
                value={loginInfo.email}
                onChange={loginChange}
                required
              />
            </InputGroup>

            <InputGroup>
              <LoginInput
                name="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={loginInfo.password}
                onChange={loginChange}
                required
              />
            </InputGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <LoginButton type="submit" disabled={loading}>
              {loading ? "처리 중..." : isSignUp ? "회원가입" : "로그인"}
            </LoginButton>
          </LoginForm>

          <ToggleSection>
            <ToggleText>{isSignUp ? "이미 계정이 있으신가요?" : "계정이 없으신가요?"}</ToggleText>
            <ToggleButton
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
            >
              {isSignUp ? "로그인" : "회원가입"}
            </ToggleButton>
          </ToggleSection>

          {/* GitHub 로그인 버튼 */}
          <GitHubLoginButton type="button" onClick={handleGitHubLogin} disabled={loading} $isDarkMode={isDarkMode}>
            <GitHubIconWrapper>{/* <GitHubSVG color={isDarkMode ? "#fff" : "#000"} /> */}</GitHubIconWrapper>
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

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const LoginInput = styled.input`
  width: 100%;
  height: 50px;
  font: var(--Body-R);
  color: var(--Text-Color);
  background-color: var(--Back-Color);
  border: 2px solid var(--Border-Color);
  border-radius: 8px;
  padding: 0 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--Brand-Colors);
    box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
  }

  &::placeholder {
    color: var(--Text-Color);
    opacity: 0.6;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font: var(--Caption-R);
  text-align: center;
  margin-top: -0.5rem;
`;

const LoginButton = styled.button`
  width: 100%;
  height: 50px;
  background-color: var(--Brand-Colors);
  color: white;
  font: var(--Body-B);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;

  &:hover:not(:disabled) {
    background-color: #2563eb;
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

const ToggleSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--Border-Color);
`;

const ToggleText = styled.span`
  font: var(--Body-R);
  color: var(--Text-Color);
  opacity: 0.7;
`;

const ToggleButton = styled.button`
  font: var(--Body-B);
  color: var(--Brand-Colors);
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    text-decoration: underline;
    color: #2563eb;
  }
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
