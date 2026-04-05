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
import styled from "styled-components";

export default function AppLayout({ children }) {
  const { isDarkMode, setUserInfo } = useZustandStore();
  const pathname = usePathname();

  const isLoginPage = pathname === "/login";
  const isFormPage = pathname === "/form";

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
