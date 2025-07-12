import {GlobalStyles} from "@/common/style";
import {Footer, Header} from "@/components/layout";
import {AboutPage, MainPage} from "@/pages";
import React from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import styled from "styled-components";
import {useZustandStore} from "@/common/store";
function App() {
  const {isDarkMode} = useZustandStore();

  return (
    <BrowserRouter>
      <GlobalStyles isDarkMode={isDarkMode} />
      <Header />
      <Layout>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </Layout>
      <Footer />
    </BrowserRouter>
  );
}

export default App;

const Layout = styled.main`
  margin: 60px auto 0px;
  max-width: 1200px;
  background-color: var(--Back-Color);
`;
