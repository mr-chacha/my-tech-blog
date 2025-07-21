import React from "react";
import styled from "styled-components";
import reactIcon from "@public/image/png/reactIcon.png";

export const PostLists = () => {
  const posts = [
    {
      id: 1,
      category: "Deep Dive",
      title: "브라우저가 화면을 그리는 과정 (Reflow, Repaint)",
      date: "2024년 11월 17일",
      readTime: "17분",
      image: reactIcon,
      href: "/blog/deep_dive/browser-paint",
      isRecommended: false,
    },
    {
      id: 2,
      category: "Manual",
      title: "CSS Trigger (Reflow, Repaint)",
      date: "2024년 10월 06일",
      readTime: "2분",
      image: reactIcon,
      href: "/blog/manual/css-trigger",
      isRecommended: false,
    },
    {
      id: 3,
      category: "Manual",
      title: "Next.js 플랫폼에 Paypal 결제 연동하기",
      date: "2024년 06월 29일",
      readTime: "8분",
      image: reactIcon,
      href: "/blog/manual/paypal",
      isRecommended: false,
    },
    {
      id: 4,
      category: "Deep Dive",
      title: "React useState 소스코드 분석하기",
      date: "2024년 04월 12일",
      readTime: "27분",
      image: reactIcon,
      href: "/blog/deep_dive/react_useState_source_code",
      isRecommended: true,
    },
    {
      id: 5,
      category: "Nextjs Blog",
      title: "기술 블로그에 댓글 기능 추가하기 (Giscus, Next.js)",
      date: "2024년 03월 15일",
      readTime: "6분",
      image: reactIcon,
      href: "/blog/nextjs_blog/giscus",
      isRecommended: true,
    },
    {
      id: 6,
      category: "Nextjs Blog",
      title: "Next.js 블로그 만들기 (14.1 최신 버전 + tailwind)",
      date: "2024년 02월 26일",
      readTime: "19분",
      image: reactIcon,
      href: "/blog/nextjs_blog/setup",
      isRecommended: true,
    },
    {
      id: 7,
      category: "Career",
      title: "[카카오 공채 바이블] 코테, 면접 준비 방법 + 꿀팁 총정리",
      date: "2023년 03월 05일",
      readTime: "44분",
      image: reactIcon,
      href: "/blog/career/kakao_bible",
      isRecommended: true,
    },
    // 추가 포스트들...
  ];

  return (
    <PostGridSection>
      <PostGrid>
        {posts.map((post) => (
          <PostLink key={post.id} href={post.href}>
            <PostCard>
              <ImageContainer>
                {post.isRecommended && <RecommendedBadge>추천</RecommendedBadge>}
                <PostImage src={post.image} alt={`thumbnail for ${post.title}`} />
              </ImageContainer>
              <PostContent>
                <PostInfo>
                  {post.isRecommended && <MobileRecommendedBadge>추천</MobileRecommendedBadge>}
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
                    <span>{post.date}</span>
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
              </PostContent>
            </PostCard>
          </PostLink>
        ))}
      </PostGrid>
    </PostGridSection>
  );
};

// 포스트 그리드
const PostGridSection = styled.section``;

const PostGrid = styled.ul`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  list-style: none;
  margin: 0;
  padding: 0;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 1024px) {
    gap: 1.5rem;
  }
`;

// 포스트 카드
const PostLink = styled.a`
  height: 100%;
  text-decoration: none;
  color: inherit;
  border: 1px solid var(--Border-Color);
  border-radius: 0.375rem;
`;

const PostCard = styled.li`
  display: flex;
  flex-direction: row;
  gap: 0;
  height: 100%;
  overflow: hidden;
  border-radius: 0.375rem;
  border: 1px solid var(--Back-Color);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  transition: all 0.3s ease;

  &:hover {
    border: 1px solid var(--Text-Color);

    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  }

  @media (min-width: 640px) {
    flex-direction: column;
    gap: 0.75rem;

    &:hover {
      box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
    }
  }
`;

// 이미지 컨테이너
const ImageContainer = styled.div`
  position: relative;
  aspect-ratio: 16/9;
  width: 33.333333%;
  border-top-left-radius: 0.375rem;

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
  padding: 0.25rem 0.5rem;
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
