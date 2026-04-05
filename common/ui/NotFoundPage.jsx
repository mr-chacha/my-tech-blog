"use client";
import React from "react";
import styled from "styled-components";
import { useRouter } from "next/navigation";

export const NotFoundPage = () => {
  const router = useRouter();

  return (
    <NotFoundContainer>
      <NotFoundContent>
        <NotFoundTitle>404</NotFoundTitle>
        <NotFoundMessage>페이지를 찾을 수 없습니다.</NotFoundMessage>
        <HomeButton onClick={() => router.push("/")}>홈으로 돌아가기</HomeButton>
      </NotFoundContent>
    </NotFoundContainer>
  );
};

const NotFoundContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--Back-Color);
`;

const NotFoundContent = styled.div`
  text-align: center;
`;

const NotFoundTitle = styled.h1`
  font-size: 8rem;
  font-weight: 700;
  color: var(--Brand-Colors);
  margin-bottom: 1rem;
`;

const NotFoundMessage = styled.p`
  font-size: 1.5rem;
  color: var(--Text-Color);
  margin-bottom: 2rem;
`;

const HomeButton = styled.button`
  padding: 0.75rem 2rem;
  background-color: var(--Brand-Colors);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  height: auto;

  &:hover {
    background-color: #2563eb;
  }
`;
