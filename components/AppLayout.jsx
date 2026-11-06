"use client";
import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { GlobalStyles } from "@/common/style";
import { Header } from "@/components/layout";
import { Footer } from "@/components/layout";
import { LoadingSpinner, OneButtonModal, TwoButtonModal } from "@/common/ui";
import { useZustandStore } from "@/common/store";
import { auth } from "@/lib/firebase-client";
import { onAuthStateChanged } from "firebase/auth";
import { apiClient } from "@/common/apis/apiClient";
import styled from "styled-components";

export default function AppLayout({ children }) {
  const { isDarkMode, setIsDarkMode, setUserInfo, setAuthReady } = useZustandStore();
  const pathname = usePathname();

  const isLoginPage = pathname === "/login";
  const isFormPage = pathname === "/form" || pathname === "/portfolio/form";

  useEffect(() => {
    try { setIsDarkMode(localStorage.getItem("isDarkMode") === "true"); } catch { /* Storage may be disabled. */ }
    let generation = 0;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const current = ++generation;
      setAuthReady(false);
      setUserInfo(null);
      try {
        if (user) {
          const result = await apiClient.post("/github/verify", {});
          if (current !== generation) return;
          if (result.isAdmin) {
            await apiClient.post("/auth/session", {});
            if (current !== generation) { await apiClient.delete("/auth/session"); return; }
            setUserInfo({
            uid: user.uid, email: user.email, displayName: user.displayName,
            photoURL: user.photoURL, emailVerified: user.emailVerified,
          });
          }
        } else { await apiClient.delete("/auth/session"); }
      } catch (error) {
        console.error("관리자 인증 확인 실패:", error.message);
      } finally {
        if (current === generation) setAuthReady(true);
      }
    });
    return () => { generation++; unsubscribe(); };
  }, [setIsDarkMode, setUserInfo, setAuthReady]);

  return (
    <>
      <GlobalStyles isDarkMode={isDarkMode} />
      {isLoginPage ? (
        children
      ) : (
        <>
          <LoadingSpinner />
          <Header />
          <Layout $layout={isFormPage}>
            {children}
            <OneButtonModal />
            <TwoButtonModal />
          </Layout>
          <Footer />
        </>
      )}
    </>
  );
}

const Layout = styled.div`
  margin: 0px auto 0px;
  max-width: ${(props) => (props?.$layout ? "100%" : "1200px")};
  background-color: var(--Back-Color);
`;
