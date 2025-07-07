import {CategoryFilter, PostLists, RecentPostLists} from "@/components/main";
import React from "react";
import styled from "styled-components";

export const MainPage = () => {
  return (
    <MainLayout>
      <PostSection>
        {/* 최근 게시물 목록 */}
        <RecentPostLists />
        <DividerContainer>
          <hr />
        </DividerContainer>
        {/* 필터 버튼 */}
        <CategoryFilter />
        {/* 게시물 목록 */}
        <PostLists />
      </PostSection>
    </MainLayout>
  );
};

const DividerContainer = styled.div`
  margin: 0 auto;
  width: 100%;
  max-width: 1200px;
  margin-top: 2.5rem;
  margin-bottom: 2.5rem;
  padding-left: 2rem;
  padding-right: 2rem;

  hr {
    border: none;
    border-top: 1px solid #e2e8f0;

    @media (prefers-color-scheme: dark) {
      border-top-color: #475569;
    }
  }
`;
const PostSection = styled.div`
  display: flex;
  flex-direction: column;
`;
const MainLayout = styled.section`
  width: 100%;
  height: 100%;
`;
