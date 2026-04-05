"use client";
import styled from "styled-components";
import React, { useEffect, useState } from "react";
import { useZustandStore } from "@/common/store";
import { PostLists, RecentPostLists } from "@/components/main";
import { useBlogApis } from "@/common/apis";
import { useSEO, getCurrentURL } from "@/common/seo";

export default function MainPage() {
  useSEO({
    title: "홈",
    description: "프론트엔드 개발자 차차의 기술 블로그입니다",
    keywords: "개발블로그, React, JavaScript, TypeScript, CSS, 프론트엔드, 웹개발, 차차",
    image: "https://chacha-dev.com/chacha-dev.png",
    url: getCurrentURL(),
    type: "website",
  });

  const { fetchPosts } = useBlogApis();
  const { setIsLoading, userInfo } = useZustandStore();
  const [recentPostLists, setRecentPostLists] = useState([]);
  const [postLists, setPostLists] = useState([]);

  const fetchPostData = async () => {
    try {
      setIsLoading(true);
      const allPosts = await fetchPosts();

      const sortedPosts = [...allPosts].sort((a, b) => {
        const getTimestamp = (post) => {
          if (post.updatedAt?._seconds) {
            return post.updatedAt._seconds * 1000 + (post.updatedAt._nanoseconds || 0) / 1000000;
          }
          if (post.updatedAt?.toDate) {
            return post.updatedAt.toDate().getTime();
          }
          if (post.updatedAt?.seconds) {
            return post.updatedAt.seconds * 1000;
          }
          if (post.updatedAt instanceof Date) {
            return post.updatedAt.getTime();
          }
          if (post.createdAt?._seconds) {
            return post.createdAt._seconds * 1000 + (post.createdAt._nanoseconds || 0) / 1000000;
          }
          if (post.createdAt?.toDate) {
            return post.createdAt.toDate().getTime();
          }
          if (post.createdAt?.seconds) {
            return post.createdAt.seconds * 1000;
          }
          if (post.createdAt instanceof Date) {
            return post.createdAt.getTime();
          }
          return 0;
        };

        return getTimestamp(b) - getTimestamp(a);
      });

      if (sortedPosts.length > 5) {
        setRecentPostLists(sortedPosts.slice(0, 5));
        setPostLists(sortedPosts.slice(5));
      } else {
        setRecentPostLists(sortedPosts);
        setPostLists([]);
      }
    } catch (error) {
      console.error("포스트 데이터 가져오기 실패:", error);
      setRecentPostLists([]);
      setPostLists([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPostData();
  }, [userInfo]);

  return (
    <MainLayout>
      {recentPostLists.length > 0 ? (
        <PostSection>
          <RecentPostLists recentPostLists={recentPostLists} />
          <MainHr />
          <PostLists postLists={postLists} setPostLists={setPostLists} />
        </PostSection>
      ) : (
        <NoPostsContainer>
          <NoPostsMessage>
            <NoPostsIcon>📝</NoPostsIcon>
            <NoPostsTitle>아직 게시물이 없습니다</NoPostsTitle>
            <NoPostsText>첫 번째 포스트를 작성해보세요!</NoPostsText>
          </NoPostsMessage>
        </NoPostsContainer>
      )}
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
