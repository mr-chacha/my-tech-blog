import {GlobalStyles} from "@/common/style";
import {Footer, Header} from "@/components/layout";
import {AboutPage, DetailPage, FormPage, LoginPage, MainPage} from "@/pages";
import React, {useEffect} from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import styled from "styled-components";
import {useZustandStore} from "@/common/store";
function App() {
  const {isDarkMode} = useZustandStore();
  const pathname = window.location.pathname;
  const layout = pathname.includes("/form");
  const isLoginPage = pathname === "/login";

  return (
    <BrowserRouter>
      <GlobalStyles isDarkMode={isDarkMode} />
      {isLoginPage ? (
        // 로그인 페이지일 때
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      ) : (
        // 다른 페이지들일 때
        <>
          <Header />
          <Layout $layout={layout}>
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/form" element={<FormPage />} />
              <Route path="/post/:id" element={<DetailPage />} />
            </Routes>
          </Layout>
          <Footer />
        </>
      )}
    </BrowserRouter>
  );
}

export default App;

const Layout = styled.main`
  margin: 60px auto 0px;
  max-width: ${(props) => (props?.$layout ? "100%" : "1200px")};
  margin-top: 64px;
  background-color: var(--Back-Color);
`;
