import {PostLists, RecentPostLists} from "@/components/main";
import React from "react";
import styled from "styled-components";

export const MainPage = () => {
  return (
    <MainLayout>
      <PostSection>
        {/* 최근 게시물 목록 */}
        <RecentPostLists />
        {/* 게시물 목록 */}
        <PostLists />
      </PostSection>
    </MainLayout>
  );
};
const PostSection = styled.div`
  display: flex;
  flex-direction: column;
`;
const MainLayout = styled.div`
  width: 100%;
  height: 2000px;
`;
