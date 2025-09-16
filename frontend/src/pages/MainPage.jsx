import {db} from "frontend/src/server/firebase";
import styled from "styled-components";
import React, {useEffect, useState} from "react";
import {useZustandStore} from "frontend/src/common/store";
import {PostLists, RecentPostLists} from "frontend/src/components/main";
import {collection, getDocs, orderBy, query} from "firebase/firestore";
import {useSEO, getCurrentURL} from "frontend/src/common/seo";
import {useBlogApis} from "frontend/src/common/apis";

export const MainPage = () => {
  // 메인 페이지 SEO 최적화
  useSEO({
    title: "홈",
    description: "프론트엔드 개발자 차차의 기술 블로그입니다",
    keywords: "개발블로그, React, JavaScript, TypeScript, CSS, 프론트엔드, 웹개발, 차차",
    image: "https://chacha-dev.com/chacha-dev.png",
    url: getCurrentURL(),
    type: "website",
  });

  const {fetchPosts} = useBlogApis();
  const {setIsLoading} = useZustandStore();

  const [recentPostLists, setRecentPostLists] = useState([]);
  const [postLists, setPostLists] = useState([]);

  const fetchPostData = async () => {
    try {
      setIsLoading(true);

      // Express API 호출
      const response = await fetchPosts();

      if (response.success) {
        setRecentPostLists(response.data.recentPosts);
        setPostLists(response.data.olderPosts);
      } else {
        console.error("포스트 데이터 가져오기 실패:", response.message);
        setRecentPostLists([]);
        setPostLists([]);
      }
    } catch (error) {
      console.error("API 호출 실패:", error);
      setRecentPostLists([]);
      setPostLists([]);
    } finally {
      setIsLoading(false);
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
          {/* 게시물 목록  */}
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
};

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
