import React, {useState} from "react";
import styled from "styled-components";
import reactIcon from "@public/image/png/reactIcon.png";
import {GlobalText} from "@/common/style";

export const RecentPostLists = () => {
  const [recentPostLists, setRecentPostLists] = useState([
    {
      postId: 1,
      category: "Product",
      title: "DAU 4만 서비스 제작, 운영 후기 (서버 비용 100만원..?)",
      content: "개발블로그 컨텐츠",
      createdAt: "2025-01-01",
      updatedAt: "2025년 05월 25일",
      viewCount: "42분",
      likeCount: 100,
      commentCount: 100,
      image: reactIcon,
      isRecommended: true,
    },
  ]);

  const [recommendedPosts] = useState([
    {
      postId: 2,
      category: "Deep Dive",
      title: "React useState 소스코드 분석하기",
      updatedAt: "2024년 04월 12일",
      readTime: "27분",
    },
    {
      postId: 3,
      category: "Nextjs Blog",
      title: "기술 블로그에 댓글 기능 추가하기 (Giscus, Next.js)",
      updatedAt: "2024년 03월 15일",
      readTime: "6분",
    },
    {
      postId: 4,
      category: "Nextjs Blog",
      title: "Next.js 블로그 만들기 (14.1 최신 버전 + tailwind)",
      updatedAt: "2024년 02월 26일",
      readTime: "19분",
    },
    {
      postId: 5,
      category: "Career",
      title: "[카카오 공채 바이블] 코테, 면접 준비 방법 + 꿀팁 총정리",
      updatedAt: "2023년 03월 05일",
      readTime: "44분",
    },
  ]);

  return (
    <MainContainer>
      {/* 최신 게시물 섹션 */}
      <LatestSection>
        <SectionTitle>최신 게시물</SectionTitle>
        <LatestPostCard>
          <PostLink>
            <LatestPostItem>
              <ImageContainer>
                {recentPostLists[0].isRecommended && <RecommendedBadge>추천</RecommendedBadge>}
                <PostImage src={recentPostLists[0].image} alt="thumbnail" />
              </ImageContainer>
              <PostContent>
                <PostInfo>
                  <MobileRecommendedBadge>추천</MobileRecommendedBadge>
                  <CategoryText>{recentPostLists[0].category}</CategoryText>
                  <PostTitle>{recentPostLists[0].title}</PostTitle>
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
                    <span>{recentPostLists[0].updatedAt}</span>
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
                    <span>{recentPostLists[0].viewCount}</span>
                  </MetaItem>
                </PostMeta>
              </PostContent>
            </LatestPostItem>
          </PostLink>
        </LatestPostCard>
      </LatestSection>

      {/* 추천 게시물 섹션 */}
      <RecommendedSection>
        <SectionTitle>추천 게시물 🔥</SectionTitle>
        <RecommendedPostsList>
          {recommendedPosts.map((post) => (
            <RecommendedPostCard key={post.postId}>
              <PostLink>
                <RecommendedPostItem>
                  <RecommendedPostContent>
                    <PostInfo>
                      <CategoryText>{post.category}</CategoryText>
                      <PostTitle>{post.title}</PostTitle>
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
                        <span>{post.updatedAt}</span>
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
                        <span>{post.readTime}</span>
                      </MetaItem>
                    </PostMeta>
                  </RecommendedPostContent>
                </RecommendedPostItem>
              </PostLink>
            </RecommendedPostCard>
          ))}
        </RecommendedPostsList>
      </RecommendedSection>
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
const LatestPostCard = styled.div``;

const PostLink = styled.a`
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
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
    border-color: var(--primary-color, #3b82f6);
  }

  @media (min-width: 640px) {
    height: 100%;
    flex-direction: column;
    gap: 0.75rem;

    &:hover {
      box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
    }
  }

  @media (prefers-color-scheme: dark) {
    border-color: #475569;

    &:hover {
      border-color: white;
    }
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

  @media (prefers-color-scheme: dark) {
    color: #9ca3af;
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
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
    border-color: var(--primary-color, #3b82f6);
  }

  @media (max-width: 640px) {
    padding: 0.5rem;
  }

  @media (prefers-color-scheme: dark) {
    border-color: #475569;

    &:hover {
      border-color: white;
    }
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
