import React, {useState} from "react";
import styled from "styled-components";

export const CategoryFilter = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const categories = [
    {name: "All", count: 21, href: "/blog"},
    {name: "🔥추천", count: 5, href: "/blog/hot"},
    {name: "Retrospect", count: 2, href: "/blog/retrospect"},
    {name: "Product", count: 1, href: "/blog/product"},
    {name: "Nextjs Blog", count: 3, href: "/blog/nextjs_blog"},
    {name: "Manual", count: 5, href: "/blog/manual"},
    {name: "Deep Dive", count: 7, href: "/blog/deep_dive"},
    {name: "Career", count: 3, href: "/blog/career"},
  ];

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <MainContainer>
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
    </MainContainer>
  );
};

// 메인 컨테이너
const MainContainer = styled.section`
  margin: 0 auto;
  width: 100%;
  max-width: 1200px;
  padding: 0 1rem;
  margin-top: 2.5rem;
`;

// 카테고리 컨테이너
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

// 카테고리 제목
const CategoryTitle = styled.h2`
  font-size: 0.875rem;

  @media (min-width: 640px) {
    font-size: 1rem;
  }
`;

// 데스크톱 섹션
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

// 카테고리 버튼
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

// 카테고리 개수
const CategoryCount = styled.span`
  margin-left: 0.25rem;
  font-size: 0.75rem;
  color: ${(props) => (props.$isActive ? "var(--background, #fff)" : "var(--muted-foreground, #6b7280)")};

  @media (prefers-color-scheme: dark) {
    color: ${(props) => (props.$isActive ? "#fff" : "#000")};
  }
`;

// 모바일 섹션
const MobileSection = styled.section`
  position: relative;
  display: block;

  @media (min-width: 640px) {
    display: none;
  }
`;

// 드롭다운 버튼
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

// 드롭다운 메뉴
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
`;

const PostCard = styled.li`
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
