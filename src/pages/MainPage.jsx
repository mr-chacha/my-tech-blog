import {CategoryFilter, PostLists, RecentPostLists} from "@/components/main";
import React, {useEffect, useState} from "react";
import styled from "styled-components";
import {db} from "@/server/firebase";
import {collection, getDocs} from "firebase/firestore";

export const MainPage = () => {
  const [recentPostLists, setRecentPostLists] = useState([]);
  const [postLists, setPostLists] = useState([]);

  const fetchPostData = async () => {
    try {
      const postData = await getDocs(collection(db, "posts"));
      const postList = postData.docs.map((doc) => ({id: doc.id, ...doc.data()}));
      if (postList.length > 5) {
        setRecentPostLists(postList.slice(0, 5));
        setPostLists(postList.slice(5));
      } else {
        setRecentPostLists(postList);
        setPostLists(postList);
      }
    } catch (error) {
      console.error("포스트 데이터 가져오기 실패:", error);
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
          {/* 게시물 목록 */}
          <PostLists postLists={postLists} />
        </PostSection>
      ) : (
        <>게시물 없음</>
      )}
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
