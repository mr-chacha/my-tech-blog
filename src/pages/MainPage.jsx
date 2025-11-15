import {db} from "@/server/firebase";
import styled from "styled-components";
import React, {useEffect, useState} from "react";
import {useZustandStore} from "@/common/store";
import {PostLists, RecentPostLists} from "@/components/main";
import {collection, getDocs, orderBy, query} from "firebase/firestore"; // where 제거
import {useSEO, getCurrentURL} from "@/common/seo";

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

  const {setIsLoading, userInfo} = useZustandStore(); // userInfo 추가

  const [recentPostLists, setRecentPostLists] = useState([]);
  const [postLists, setPostLists] = useState([]);

  const fetchPostData = async () => {
    try {
      setIsLoading(true);
      // 모든 포스트를 가져온 후 클라이언트에서 필터링 (인덱스 에러 방지)
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

      const postData = await getDocs(q);
      const allPosts = postData.docs.map((doc) => ({id: doc.id, ...doc.data()}));

      // 클라이언트에서 필터링: 관리자면 모든 포스트, 일반 사용자면 공개 포스트만
      const filteredPosts = userInfo
        ? allPosts // 관리자는 모든 포스트 (비공개 포함)
        : allPosts.filter((post) => post.published !== false); // 일반 사용자는 공개 포스트만

      if (filteredPosts.length > 5) {
        setRecentPostLists(filteredPosts.slice(0, 5));
        setPostLists(filteredPosts.slice(5));
      } else {
        setRecentPostLists(filteredPosts);
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
  }, [userInfo]); // userInfo 의존성 추가

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
