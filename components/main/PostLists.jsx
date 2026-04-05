"use client";
import React, {useState} from "react";
import styled from "styled-components";
import {useCustomNav} from "@/common/util";
import {useZustandStore} from "@/common/store";

const defaultImage = "/chacha-dev.png";

export const PostLists = ({postLists}) => {
  const {userInfo} = useZustandStore();
  const navHandler = useCustomNav();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // postLists를 기반으로 동적 카테고리 생성
  const generateCategories = (posts) => {
    if (!posts || posts.length === 0) {
      return [{name: "All", count: 0}];
    }

    // 카테고리별 포스트 개수 계산
    const categoryCount = {};
    posts.forEach((post) => {
      const category = post.category || "기타";
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    // 카테고리 배열 생성
    const categories = [{name: "All", count: posts.length}];
    Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .forEach(([categoryName, count]) => {
        categories.push({
          name: categoryName,
          count: count,
        });
      });

    return categories;
  };

  const categories = generateCategories(postLists);

  // 선택된 카테고리에 따른 포스트 필터링
  const getFilteredPosts = () => {
    if (!postLists) return [];

    if (selectedCategory === "All") {
      return postLists;
    } else if (selectedCategory === "🔥추천") {
      return postLists.filter((post) => post.isRecommended);
    } else {
      return postLists.filter((post) => post.category === selectedCategory);
    }
  };

  const filteredPosts = getFilteredPosts();

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

  // 빈 배열인 경우 처리
  if (!postLists || postLists.length === 0) {
    return (
      <PostListsSection>
        <NoPostsMessage>더 많은 게시물이 곧 업데이트될 예정입니다!</NoPostsMessage>
      </PostListsSection>
    );
  }

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <>
      <CategoryFilterSection>
        {/* 카테고리 필터 */}
        <CategoryContainer>
          <CategoryTitle>Category</CategoryTitle>

          {/* 데스크톱 버전 */}
          <DesktopSection>
            <CategoryList>
              {categories.map((category) => (
                <CategoryItem key={category.name}>
                  <CategoryButton
                    href={category.href}
                    $isActive={selectedCategory === category.name}
                    onClick={() => handleCategoryClick(category.name)}
                  >
                    {category.name}
                    <CategoryCount $isActive={selectedCategory === category.name}>({category.count})</CategoryCount>
                  </CategoryButton>
                </CategoryItem>
              ))}
            </CategoryList>
          </DesktopSection>

          {/* 모바일 버전 */}
          <MobileSection>
            <DropdownButton onClick={toggleDropdown}>
              <DropdownText>
                {selectedCategory} ({categories.find((cat) => cat.name === selectedCategory)?.count})
              </DropdownText>
              <ChevronIcon $isOpen={isDropdownOpen}>
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
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              </ChevronIcon>
            </DropdownButton>

            {isDropdownOpen && (
              <DropdownMenu>
                {categories.map((category) => (
                  <DropdownItem
                    key={category.name}
                    onClick={() => {
                      handleCategoryClick(category.name);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {category.name} ({category.count})
                  </DropdownItem>
                ))}
              </DropdownMenu>
            )}
          </MobileSection>
        </CategoryContainer>
      </CategoryFilterSection>

      <PostListsSection>
        <PostGrid>
          {filteredPosts.map((post) => (
            <PostBox key={post.id} onClick={() => navHandler(`/post/${post.id}`)}>
              <PostCard>
                <ImageContainer>
                  <PostImage
                    src={post.image || defaultImage}
                    alt={`thumbnail for ${post.title || "게시물"}`}
                    onError={(e) => {
                      e.target.src = defaultImage;
                    }}
                  />
                </ImageContainer>
                <PostContent>
                  <PostInfo>
                    {post.isRecommended && <MobileRecommendedBadge>추천</MobileRecommendedBadge>}
                    {userInfo && post.isPrivate && <PrivateBadge>🔒</PrivateBadge>}
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
                  </PostMeta>
                </PostContent>
              </PostCard>
            </PostBox>
          ))}
        </PostGrid>
      </PostListsSection>
    </>
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

const NoPostsMessage = styled.div`
  text-align: center;
  color: #6b7280;
`;

const PostListsSection = styled.section`
  margin: 0 auto;
  width: 100%;
  max-width: 1200px;
  padding: 0 1rem;

  @media (min-width: 640px) {
    padding: 0 1.5rem;
  }

  @media (min-width: 1024px) {
    padding: 0 2rem;
  }
`;

const PostGrid = styled.ul`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
  }
`;

const PostBox = styled.div`
  height: 100%;
  text-decoration: none;
  color: inherit;
  border: 1px solid var(--Border-Color);
  border-radius: 0.375rem;
  cursor: pointer;
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

const CategoryFilterSection = styled.section`
  margin: 0 auto;
  width: 100%;
  max-width: 1200px;
  padding: 0 1rem;
  margin-top: 2.5rem;
`;

const CategoryContainer = styled.div`
  margin-bottom: 1.25rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  padding-left: 0.5rem;
  font-weight: bold;

  @media (min-width: 640px) {
    padding-left: 0;
  }
`;

const CategoryTitle = styled.h2`
  font-size: 0.875rem;

  @media (min-width: 640px) {
    font-size: 1rem;
  }
`;

const DesktopSection = styled.section`
  display: none;

  @media (min-width: 640px) {
    display: block;
  }
`;

const CategoryList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const CategoryItem = styled.li``;

const CategoryButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  height: auto;
  border-radius: 0.375rem;
  padding: 0.25rem 0.625rem;
  text-decoration: none;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--ring-color, #3b82f6);
  }

  @media (prefers-color-scheme: dark) {
    ${(props) =>
      props.$isActive
        ? `
      background-color:#000;
      color: #fff;
    `
        : `
      border: 1px solid var(--Border-Color);
      background-color:var(--Back-Color);
      color: var(--Text-Color);
      
      &:hover {
        background-color: var(--Brand-Colors-Two);
        color: var(--Brand-Colors);
     
      }
    `}
  }
`;

const CategoryCount = styled.span`
  margin-left: 0.25rem;
  font-size: 0.75rem;
  color: ${(props) => (props.$isActive ? "var(--background, #fff)" : "var(--muted-foreground, #6b7280)")};

  @media (prefers-color-scheme: dark) {
    color: ${(props) => (props.$isActive ? "#fff" : "#000")};
  }
`;

const MobileSection = styled.section`
  position: relative;
  display: block;

  @media (min-width: 640px) {
    display: none;
  }
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 0.375rem;
  border: 1px solid var(--input-border, #e2e8f0);
  background-color: var(--background, #fff);
  padding: 0.375rem 0.75rem;
  transition: all 0.2s ease;
  cursor: pointer;
  height: auto;
  width: 180px;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--ring-color, #3b82f6);
  }

  @media (prefers-color-scheme: dark) {
    border-color: var(--input-border-dark, #475569);
    background-color: var(--background-dark, #1e293b);
    color: var(--foreground-dark, #fff);
  }
`;

const DropdownText = styled.span`
  pointer-events: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChevronIcon = styled.div`
  height: 1rem;
  width: 1rem;
  opacity: 0.5;
  transition: transform 0.2s ease;
  transform: ${(props) => (props.$isOpen ? "rotate(180deg)" : "rotate(0deg)")};

  svg {
    width: 100%;
    height: 100%;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 50;
  margin-top: 0.25rem;
  border-radius: 0.375rem;
  border: 1px solid var(--input-border, #e2e8f0);
  background-color: var(--background, #fff);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05);
  overflow: hidden;

  @media (prefers-color-scheme: dark) {
    border-color: var(--input-border-dark, #475569);
    background-color: var(--background-dark, #1e293b);
  }
`;

const DropdownItem = styled.div`
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--accent, #f1f5f9);
    color: var(--accent-foreground, #0f172a);
  }

  @media (prefers-color-scheme: dark) {
    color: var(--foreground-dark, #fff);

    &:hover {
      background-color: var(--accent-dark, #334155);
      color: var(--accent-foreground-dark, #fff);
    }
  }
`;
