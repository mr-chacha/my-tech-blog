import React, {useState} from "react";
import styled from "styled-components";
import reactIcon from "@public/image/png/reactIcon.png";
import {useCustomNav} from "@/common/util";

export const RecentPostLists = ({recentPostLists}) => {
  console.log("recentPostLists", recentPostLists);

  // 날짜 포맷팅 함수
  const formatDate = (timestamp) => {
    if (!timestamp) return "";

    // Firebase Timestamp 객체인 경우
    if (timestamp.toDate) {
      return timestamp
        .toDate()
        .toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\./g, "년 ")
        .replace(/\s$/, "일");
    }

    // 일반 Date 객체인 경우
    if (timestamp instanceof Date) {
      return timestamp
        .toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\./g, "년 ")
        .replace(/\s$/, "일");
    }

    // 문자열인 경우 그대로 반환
    return timestamp;
  };

  // 읽는 시간 계산 함수 (대략적으로 글자 수 기반)
  const calculateReadTime = (content) => {
    if (!content) return "1분";

    const wordsPerMinute = 200; // 한국어 기준 분당 읽기 속도
    const wordCount = content.length / 2; // 대략적인 단어 수 계산
    const readTime = Math.ceil(wordCount / wordsPerMinute);

    return `${readTime}분`;
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
              <PostImage
                src={latestPost.image || reactIcon}
                alt="thumbnail"
                onError={(e) => {
                  e.target.src = reactIcon; // 이미지 로드 실패 시 기본 이미지로 대체
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M8 2v4"></path>
                      <path d="M16 2v4"></path>
                      <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                      <path d="M3 10h18"></path>
                      <path d="M8 14h.01"></path>
                      <path d="M12 14h.01"></path>
                      <path d="M16 14h.01"></path>
                      <path d="M8 18h.01"></path>
                      <path d="M12 18h.01"></path>
                      <path d="M16 18h.01"></path>
                    </svg>
                  </CalendarIcon>
                  <span>{formatDate(latestPost.updatedAt || latestPost.createdAt)}</span>
                </MetaItem>
                <MetaItem>
                  <ClockIcon>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16.5 12"></polyline>
                    </svg>
                  </ClockIcon>
                  <span>{calculateReadTime(latestPost.content)}</span>
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
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M8 2v4"></path>
                            <path d="M16 2v4"></path>
                            <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                            <path d="M3 10h18"></path>
                            <path d="M8 14h.01"></path>
                            <path d="M12 14h.01"></path>
                            <path d="M16 14h.01"></path>
                            <path d="M8 18h.01"></path>
                            <path d="M12 18h.01"></path>
                            <path d="M16 18h.01"></path>
                          </svg>
                        </CalendarIcon>
                        <span>{formatDate(post.updatedAt || post.createdAt)}</span>
                      </MetaItem>
                      <MetaItem>
                        <ClockIcon>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16.5 12"></polyline>
                          </svg>
                        </ClockIcon>
                        <span>{calculateReadTime(post.content)}</span>
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

// 메인 컨테이너
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

// 섹션 공통 스타일
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

// 이미지 컨테이너
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

// 메타 정보
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

// 추천 게시물 스타일
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
  @media (max-width: 980px) {
    &:last-child {
      display: none;
    }
  }
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
