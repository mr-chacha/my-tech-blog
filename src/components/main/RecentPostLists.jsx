import React from "react";
import styled from "styled-components";
import {CalendarSVG} from "@public/Icon";
import {useCustomNav} from "@/common/util";
import defaultImage from "@public/chacha-dev.png";
import {useZustandStore} from "@/common/store";

export const RecentPostLists = ({recentPostLists}) => {
  const {userInfo} = useZustandStore();
  // 날짜 포맷팅 함수
  // 날짜 포맷팅 함수
  const formatDate = (timestamp) => {
    if (!timestamp) return "";

    let date;

    try {
      // Firebase Timestamp 객체 - seconds 속성
      if (timestamp && typeof timestamp === "object" && timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      }
      // Firebase Timestamp 객체 - _seconds 속성 (언더스코어)
      else if (timestamp && typeof timestamp === "object" && timestamp._seconds) {
        date = new Date(timestamp._seconds * 1000);
      }
      // toDate() 메서드가 있는 경우
      else if (timestamp && typeof timestamp.toDate === "function") {
        date = timestamp.toDate();
      }
      // 이미 Date 객체인 경우
      else if (timestamp instanceof Date) {
        date = timestamp;
      }
      // ISO 문자열인 경우
      else if (typeof timestamp === "string") {
        date = new Date(timestamp);
      }
      // 숫자 (Unix timestamp milliseconds)
      else if (typeof timestamp === "number") {
        date = new Date(timestamp);
      } else {
        console.warn("Unknown timestamp format:", timestamp);
        return "";
      }

      // date가 유효한지 확인
      if (!date || isNaN(date.getTime())) {
        console.warn("Invalid date:", timestamp);
        return "";
      }

      // 날짜를 한글 형식으로 변환
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}년 ${month}월 ${day}일`;
    } catch (error) {
      console.error("formatDate error:", error, "timestamp:", timestamp);
      return "";
    }
  };

  const navHandler = useCustomNav();
  const latestPost = recentPostLists[0];

  return (
    <MainContainer>
      {/* 최신 게시물 섹션 */}
      <LatestSection>
        <SectionTitle>최신 게시물</SectionTitle>
        <LatestPostCard onClick={() => navHandler(`/post/${latestPost.id}`)}>
          <LatestPostItem>
            <ImageContainer>
              {latestPost.isRecommended && <RecommendedBadge>추천</RecommendedBadge>}
              {userInfo && latestPost.isPrivate && <PrivateBadge>🔒</PrivateBadge>}
              <PostImage
                src={latestPost.image || defaultImage}
                alt="thumbnail"
                onError={(e) => {
                  e.target.src = defaultImage;
                }}
              />
            </ImageContainer>
            <PostContent>
              <PostInfo>
                {latestPost.isRecommended && <MobileRecommendedBadge>추천</MobileRecommendedBadge>}
                <CategoryText>{latestPost.category || "기타"}</CategoryText>
                <PostTitle>{latestPost.title || "제목 없음"}</PostTitle>
              </PostInfo>
              <PostMeta>
                <MetaItem>
                  <CalendarIcon>
                    <CalendarSVG />
                  </CalendarIcon>
                  <span>{formatDate(latestPost.updatedAt || latestPost.createdAt)}</span>
                </MetaItem>
              </PostMeta>
            </PostContent>
          </LatestPostItem>
        </LatestPostCard>
      </LatestSection>
      {recentPostLists.length > 1 && (
        <RecommendedSection>
          <SectionTitle>다른 게시물들</SectionTitle>
          <RecommendedPostsList>
            {recentPostLists.slice(1, 5).map((post) => (
              <RecommendedPostCard key={post.id} onClick={() => navHandler(`/post/${post.id}`)}>
                <RecommendedPostItem>
                  <RecommendedPostContent>
                    <PostInfo>
                      <CategoryText>{post.category || "기타"}</CategoryText>
                      <PostTitle>{post.title || "제목 없음"}</PostTitle>
                    </PostInfo>
                    <PostMeta>
                      <MetaItem>
                        <CalendarIcon>
                          <CalendarSVG />
                        </CalendarIcon>
                        <span>{formatDate(post.updatedAt || post.createdAt)}</span>
                      </MetaItem>
                    </PostMeta>
                  </RecommendedPostContent>
                </RecommendedPostItem>
              </RecommendedPostCard>
            ))}
          </RecommendedPostsList>
        </RecommendedSection>
      )}
    </MainContainer>
  );
};

const PrivateBadge = styled.div`
  position: absolute;
  left: 0.25rem;
  top: 0.25rem;
  z-index: 15;
  border-radius: 0.125rem;
  background-color: #6b7280;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #fafaf9;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  @media (max-width: 640px) {
    position: static;
    display: inline-flex;
    margin-right: 0.5rem;
    padding: 0.125rem 0.375rem;
  }
`;
const MainContainer = styled.div`
  margin: 0 auto;
  width: 100%;
  max-width: 1200px;
  padding: 0 1rem;
  display: flex;
  gap: 1.5rem;
  margin-top: 1.5rem;
  flex-direction: column;
  align-items: stretch;

  @media (min-width: 640px) {
    margin-top: 2.5rem;
    flex-direction: row;
  }

  @media (min-width: 1024px) {
    gap: 2rem;
  }
`;

const Section = styled.section`
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const LatestSection = styled(Section)`
  @media (min-width: 980px) {
    min-width: 520px;
  }
`;

const RecommendedSection = styled(Section)``;

const SectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: bold;
  margin-bottom: 0.75rem;

  @media (min-width: 640px) {
    font-size: 1.5rem;
  }
`;
const LatestPostCard = styled.div`
  height: 100%;
  cursor: pointer;
`;

const LatestPostItem = styled.li`
  display: flex;
  flex-direction: row;
  gap: 0;
  height: 100%;
  overflow: hidden;
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  transition: all 0.3s ease;
  border: 1px solid var(--Border-Color);
  border-radius: 0.375rem;

  &:hover {
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
    border: 1px solid var(--Text-Color);
  }

  @media (min-width: 640px) {
    height: 100%;
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const ImageContainer = styled.div`
  position: relative;
  aspect-ratio: 16/9;
  width: 33.333333%;
  border-top-left-radius: 0.375rem;
  border-bottom: 1px solid #e2e8f0;

  @media (max-width: 550px) {
    display: none;
  }

  @media (min-width: 640px) {
    width: 100%;
    border-bottom: 1px solid #e2e8f0;
  }
`;

const RecommendedBadge = styled.div`
  position: absolute;
  left: 0.25rem;
  top: 0.25rem;
  z-index: 10;
  border-radius: 0.125rem;
  background-color: #ef4444;
  padding: 0.5rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #fafaf9;

  @media (max-width: 640px) {
    display: none;
  }
`;

const MobileRecommendedBadge = styled.div`
  position: absolute;
  right: 0.25rem;
  top: 0.25rem;
  z-index: 20;
  border-radius: 0.125rem;
  background-color: #ef4444;
  padding: 0.125rem 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #fafaf9;

  @media (min-width: 640px) {
    display: none;
  }
`;

const PostImage = styled.img`
  position: absolute;
  height: 100%;
  width: 100%;
  inset: 0;
  object-fit: cover;
  color: transparent;
`;

// 포스트 콘텐츠
const PostContent = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;

  @media (min-width: 640px) {
    padding: 1rem;
    padding-top: 0.25rem;
  }
`;

const PostInfo = styled.div``;

const CategoryText = styled.div`
  font-size: 0.75rem;
  font-weight: 500;
  color: #db2777;

  @media (min-width: 640px) {
    font-size: 0.875rem;
  }

  @media (min-width: 1024px) {
    font-size: 1rem;
  }
`;

const PostTitle = styled.h2`
  margin: 0.25rem 0;
  font-size: 0.875rem;
  font-weight: 600;

  @media (min-width: 640px) {
    margin-bottom: 0.75rem;
    font-size: 1rem;
    font-weight: bold;
  }

  @media (min-width: 1024px) {
    font-size: 1.125rem;
  }
`;

const PostMeta = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #6b7280;

  @media (min-width: 640px) {
    font-size: 0.875rem;
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const CalendarIcon = styled.div`
  width: 0.875rem;

  svg {
    width: 100%;
    height: 100%;
  }
`;

const ClockIcon = styled.div`
  width: 0.875rem;

  svg {
    width: 100%;
    height: 100%;
  }
`;

const RecommendedPostsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
`;

const RecommendedPostCard = styled.div`
  flex: 1;
  height: 100%;
  cursor: pointer;
`;

const RecommendedPostItem = styled.li`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0;
  flex: 1;
  padding: 0.75rem;
  height: 100%;
  overflow: hidden;
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.3);
  transition: all 0.3s ease;
  border: 1px solid var(--Border-Color);
  border-radius: 0.375rem;
  &:hover {
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
    border: 1px solid var(--Text-Color);
  }

  @media (max-width: 640px) {
    padding: 0.5rem;
  }
`;

const RecommendedPostContent = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;

  @media (min-width: 980px) {
    justify-content: space-between;
  }
`;
