import {CategoryFilter, PostLists, RecentPostLists} from "@/components/main";
import React from "react";
import styled from "styled-components";

export const MainPage = () => {
  return (
    <MainLayout>
      <PostSection>
        {/* 최근 게시물 목록 */}
        <RecentPostLists />
        {/*hr */}
        <MainHr />
        {/* 필터 버튼 */}
        <CategoryFilter />
        {/* 게시물 목록 */}
        <PostLists />
      </PostSection>
    </MainLayout>
  );
};

const MainHr = styled.hr`
  margin: 0 auto;
  width: 100%;
  max-width: 1200px;
  margin-top: 2.5rem;
  margin-bottom: 2.5rem;
  padding-left: 2rem;
  padding-right: 2rem;
  border: none;
  border-top: 1px solid #e5e7eb;
`;
const PostSection = styled.div`
  display: flex;
  flex-direction: column;
`;
const MainLayout = styled.section`
  width: 100%;
  height: 100%;
`;
