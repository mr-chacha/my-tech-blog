import {GlobalStyles} from "@/common/style";
import {Footer, Header} from "@/components/layout";
import {AboutPage, DetailPage, FormPage, LoginPage, MainPage} from "@/pages";
import React, {useEffect} from "react";
import {BrowserRouter, Route, Routes, Navigate, useLocation} from "react-router-dom";
import styled from "styled-components";
import {useZustandStore} from "@/common/store";
import {auth} from "@/server/firebase";
import {onAuthStateChanged} from "firebase/auth";
import {LoadingSpinner, NotFoundPage, OneButtonModal, TwoButtonModal} from "@/common/ui";

function AppContent() {
  const {isDarkMode, userInfo, setUserInfo} = useZustandStore();
  const location = useLocation();
  const layout = location.pathname.includes("/form");
  const isLoginPage = location.pathname === "/login";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserInfo({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
        });
      } else {
        setUserInfo(null);
      }
    });

    return () => unsubscribe();
  }, [setUserInfo]);

  return (
    <>
      <GlobalStyles isDarkMode={isDarkMode} />
      {isLoginPage ? (
        // 로그인 페이지일 때
        <Routes>
          <Route path="/login" element={userInfo ? <Navigate to="/" replace /> : <LoginPage />} />
        </Routes>
      ) : (
        // 다른 페이지들일 때
        <>
          <LoadingSpinner />
          <Header />
          <Layout $layout={layout}>
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/form" element={<FormPage />} />
              <Route path="/post/:detailId" element={<DetailPage />} />
              {/* 로그인된 사용자가 /login에 접근하려 할 때 메인으로 리다이렉트 */}
              <Route path="/login" element={<Navigate to="/" replace />} />

              {/* 404 페이지 - 가장 마지막에 위치 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <OneButtonModal />
            <TwoButtonModal />
          </Layout>

          <Footer />
        </>
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

const Layout = styled.main`
  margin: 60px auto 0px;
  max-width: ${(props) => (props?.$layout ? "100%" : "1200px")};
  margin-top: 64px;
  background-color: var(--Back-Color);
`;
export default App;
