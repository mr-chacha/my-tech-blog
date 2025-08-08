import {CategoryFilter, PostLists, RecentPostLists} from "@/components/main";
import React, {useEffect, useState} from "react";
import styled from "styled-components";
import {db} from "@/server/firebase";
import {collection, getDocs, orderBy, query} from "firebase/firestore";

export const MainPage = () => {
  const [recentPostLists, setRecentPostLists] = useState([]);
  const [postLists, setPostLists] = useState([]);

  const fetchPostData = async () => {
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

      const postData = await getDocs(q);
      const postList = postData.docs.map((doc) => ({id: doc.id, ...doc.data()}));

      if (postList.length > 5) {
        // 최신 5개
        setRecentPostLists(postList.slice(0, 5));
        setPostLists(postList.slice(5));
      } else {
        // 5개 이하면 모두 최신 포스트로
        setRecentPostLists(postList);
        setPostLists([]);
      }
    } catch (error) {
      console.error("포스트 데이터 가져오기 실패:", error);

      setRecentPostLists([]);
      setPostLists([]);
    }
  };

  useEffect(() => {
    fetchPostData();
  }, []);

  return (
    <MainLayout>
      {recentPostLists.length > 0 ? (
        <PostSection>
          {/* 최근 게시물 목록 */}
          <RecentPostLists recentPostLists={recentPostLists} />
          {/*hr */}
          <MainHr />
          {/* 필터 버튼 */}
          <CategoryFilter />
          {/* 게시물 목록 - postLists prop 전달 */}
          <PostLists postLists={postLists} />
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
};

// 게시물 없음 상태 스타일 추가
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
