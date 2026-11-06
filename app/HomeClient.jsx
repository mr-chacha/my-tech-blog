"use client";

import { usePostFeed } from "@/common/hooks/usePostFeed";
import styled from "styled-components";
import React from "react";
import { useZustandStore } from "@/common/store";
import { PostLists, RecentPostLists } from "@/components/main";

export default function HomeClient({ initialPage, initialError = false }) {
  const { userInfo, authReady } = useZustandStore();
  const feed = usePostFeed(initialPage, initialError, userInfo, authReady);
  return (
    <MainLayout>
      {feed.error && <p role="alert">{typeof feed.error === "string" ? feed.error : "게시물을 불러오지 못했습니다."} <button type="button" disabled={feed.loading} onClick={feed.retry}>다시 시도</button></p>}
      {feed.recentPosts.length > 0 && <><RecentPostLists recentPostLists={feed.recentPosts} /><MainHr /></>}
      <PostLists pending={feed.loading || !!feed.error} postLists={feed.posts} categories={[{ key: "", name: "전체", count: feed.total }, ...(feed.categories || [])]} selectedCategory={feed.category} onCategoryChange={feed.setCategory} />
      {feed.loading && <p role="status">게시물을 불러오는 중...</p>}
      {feed.nextCursor && <button type="button" disabled={feed.loading} onClick={feed.loadMore}>더 보기</button>}
    </MainLayout>
  );
}

const NoPostsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 2rem;
`;

const NoPostsMessage = styled.div`
  text-align: center;
  color: #6b7280;
`;

const NoPostsIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const NoPostsTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
`;

const NoPostsText = styled.p`
  font-size: 1rem;
  color: #6b7280;
`;

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
