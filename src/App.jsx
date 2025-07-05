import {GlobalStyles} from "@/common/style";
import {Header} from "@/components/layout";
import {MainPage} from "@/pages";
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
        <AppLayout>
          <Routes>
            <Route path="/" element={<MainPage />} />
          </Routes>
        </AppLayout>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
const AppLayout = styled.div`
  margin: 0 auto;
  max-width: 1200px;
`;
const Layout = styled.div`
  padding: 0px 20px;
  background-color: var(--Back-Color);
  margin-top: 64px;
`;
