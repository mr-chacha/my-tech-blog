import React, {useState, useEffect} from "react";
import {useParams} from "react-router-dom";
import styled from "styled-components";
import {useBlogApis} from "@/common/apis";
import {formatTimestamp} from "@/common/util";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks"; // 이 플러그인 추가 설치

export const DetailPage = () => {
  const {fetchDetailPost} = useBlogApis();
  const [activeId, setActiveId] = useState("");
  const [detailPost, setDetailPost] = useState("");

  const {detailId} = useParams();

  const getDetailPost = async (detailId) => {
    try {
      const postData = await fetchDetailPost(detailId);
      setDetailPost(postData);
      console.log("받아온 postData:", postData);
    } catch (error) {
      console.error("포스트 가져오기 오류:", error);
    }
  };

  useEffect(() => {
    if (detailId) {
      getDetailPost(detailId);
    }
  }, [detailId]);

  const tocItems = [
    {title: "페이팔 계정 생성", href: "#페이팔-계정-생성", isSubItem: false, id: "페이팔-계정-생성"},
    {title: "Front-end 구현", href: "#front-end-구현", isSubItem: false, id: "front-end-구현"},
    {title: "Back-end 구현", href: "#back-end-구현", isSubItem: false, id: "back-end-구현"},
    {title: "Production 배포", href: "#production-배포", isSubItem: false, id: "production-배포"},
    {
      title: "라이브 환경 credential 발급",
      href: "#라이브-환경-credential-발급",
      isSubItem: true,
      id: "라이브-환경-credential-발급",
    },
    {title: "Reference", href: "#reference", isSubItem: false, id: "reference"},
  ];

  const scrollToTop = () => {
    window.scrollTo({top: 0, behavior: "smooth"});
  };

  const handleComment = () => {
    console.log("댓글 기능");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("링크가 복사되었습니다!");
    } catch (err) {
      console.error("복사 실패:", err);
    }
  };

  return (
    <DetailPageLayout>
      {/* 헤더 */}
      <HeaderContainer>
        <Title>{detailPost.title}</Title>

        <CategoryContainer>
          <CategoryLink href="/blog/manual">{detailPost.category}</CategoryLink>
        </CategoryContainer>

        <MetaContainer>
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
            <span>{formatTimestamp(detailPost.createdAt)}</span>
          </MetaItem>
        </MetaContainer>

        <Divider />
      </HeaderContainer>

      {/* 반응형일때 보여지는 네브 */}
      <TOCNavigation>
        <TOCTitle id="table-of-contents-top">On this page</TOCTitle>
        <TOCList>
          {tocItems.map((item, index) => (
            <TOCItem key={index} $isSubItem={item.isSubItem}>
              <TOCLink href={item.href}>{item.title}</TOCLink>
            </TOCItem>
          ))}
        </TOCList>
        <TOCDivider />
      </TOCNavigation>

      <article>
        <SidebarContainer>
          <StickyWrapper>
            <SidebarTOCContainer>
              <SidebarTOCTitle>On this page</SidebarTOCTitle>
              <SidebarTOCList>
                {tocItems.map((item, index) => (
                  <SidebarTOCItem key={index} $isSubItem={item.isSubItem}>
                    <SidebarTOCLink href={item.href} $isActive={activeId === item.id}>
                      {item.title}
                    </SidebarTOCLink>
                  </SidebarTOCItem>
                ))}
              </SidebarTOCList>
            </SidebarTOCContainer>

            <ActionButtonsContainer>
              <ActionButton onClick={scrollToTop} title="맨 위로">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 3h14"></path>
                  <path d="m18 13-6-6-6 6"></path>
                  <path d="M12 7v14"></path>
                </svg>
              </ActionButton>

              <ActionButton onClick={handleComment} title="댓글">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  <path d="M13 8H7"></path>
                  <path d="M17 12H7"></path>
                </svg>
              </ActionButton>

              <ActionButton onClick={handleCopy} title="링크 복사">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                </svg>
              </ActionButton>
            </ActionButtonsContainer>
          </StickyWrapper>
        </SidebarContainer>
        <MarkdownContainer>
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{detailPost.content}</ReactMarkdown>
        </MarkdownContainer>
      </article>
    </DetailPageLayout>
  );
};

const MarkdownContainer = styled.div`
  /* 헤딩 스타일링 */
  h1 {
    font-size: 2.5rem;
    font-weight: bold;
    margin-top: 2rem;
    margin-bottom: 1rem;
    line-height: 1.2;
    color: var(--Text-Color);
  }

  h2 {
    font-size: 2rem;
    font-weight: bold;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    line-height: 1.3;
    color: var(--Text-Color);
  }

  h3 {
    font-size: 1.5rem;
    font-weight: bold;
    margin-top: 1.25rem;
    margin-bottom: 0.5rem;
    color: var(--Text-Color);
  }

  /* 텍스트 스타일링 */
  p {
    font-size: var(--Headline-R);
    line-height: 1.7;
    margin-bottom: 1rem;
    color: var(--Text-Color);
    white-space: pre-line;
  }

  strong {
    font-weight: bold;
    color: var(--Text-Color);
  }

  em {
    font-style: italic;
    color: var(--Text-Color);
  }

  /* 이미지 스타일링 */
  img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 1.5rem auto;
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  /* 코드 스타일링 */
  code {
    background: #f1f5f9;
    padding: 3px 6px;
    border-radius: 4px;
    font-size: 0.875rem;
    font-family: Monaco, Consolas, monospace;
    color: var(--Back-Color);
  }

  pre {
    background: #f8fafc;
    padding: 16px;
    border-radius: 8px;
    overflow: auto;
    margin: 1.5rem 0;
    border: 1px solid #e2e8f0;

    code {
      background: none;
      padding: 0;
      font-family: Monaco, Consolas, monospace;
      font-size: 0.875rem;
    }
  }

  /* 리스트 스타일링 */
  ul {
    margin-left: 1.5rem;
    margin-bottom: 1rem;
    list-style-type: disc;
  }

  li {
    margin-bottom: 0.5rem;
    line-height: 1.6;
  }

  /* 링크 스타일링 */
  a {
    color: #3b82f6;
    text-decoration: underline;

    &:hover {
      color: #2563eb;
    }
  }

  /* 인용문 스타일링 */
  blockquote {
    border-left: 4px solid #3b82f6;
    padding-left: 1rem;
    margin: 1rem 0;
    color: #6b7280;
    background-color: #f8fafc;
    padding: 1rem;
    border-radius: 0.25rem;
  }
`;
const SidebarContainer = styled.aside`
  position: absolute;
  top: -200px;
  left: 100%;
  margin-bottom: -100px;
  display: none;
  height: calc(100% + 150px);

  @media (min-width: 1280px) {
    display: block;
  }
`;

const StickyWrapper = styled.div`
  position: sticky;
  bottom: 0;
  top: 200px;
  z-index: 10;
  margin-left: 5rem;
  margin-top: 200px;
  width: 200px;
`;

const SidebarTOCContainer = styled.div`
  margin-bottom: 1rem;
  border-left: 1px solid #e5e7eb;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;

  border-left-color: #374151;
`;

const SidebarTOCTitle = styled.div`
  margin-bottom: 0.25rem;
  font-weight: 700;
  color: #374151;

  color: var(--Text-Color);
`;

const SidebarTOCList = styled.ul`
  font-size: 0.75rem;
  line-height: 1rem;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const SidebarTOCItem = styled.li`
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  transition: all 0.2s ease;
  margin-left: ${(props) => (props.$isSubItem ? "1rem" : "0")};
`;

const SidebarTOCLink = styled.a`
  color: ${(props) => (props.$isActive ? "#db2777" : "#6b7280")};
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: #db2777;
  }

  color: ${(props) => (props.$isActive ? "#f472b6" : "#9ca3af")};

  &:hover {
    color: #f472b6;
  }
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  outline: 1px solid #e2e8f0;
  background-color: transparent;
  aspect-ratio: 1;
  padding: 0.5rem;
  border: none;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px #3b82f6;
  }

  &:hover {
    background-color: #f1f5f9;
    color: #0f172a;
  }

  &:disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  outline-color: #475569;
  color: var(--Text-Color);

  &:hover {
    background-color: #334155;
    color: #fff;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

// 기존 스타일드 컴포넌트들...
const TOCNavigation = styled.nav`
  @media (min-width: 1280px) {
    display: none;
  }
`;

const TOCTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;

  color: var(--Text-Color);
  font: var(--Title);
`;

const TOCList = styled.ul`
  margin: 0;
  padding: 0;
  padding-left: 1.5rem;
  list-style: disc;
  font: var(--Body-M);

  ::marker {
    color: ${(props) => (props.$isDarkMode ? "#4b5563" : "#d1d5db")};
  }
`;

const TOCItem = styled.li`
  margin-top: 0;
  margin-bottom: 0;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  margin-left: ${(props) => (props.$isSubItem ? "1rem" : "0")};
`;

const TOCLink = styled.a`
  color: var(--Text-Color);
  text-decoration: none;
  text-underline-offset: 4px;
  border-bottom: 1px solid var(--Text-Color);
  &:hover {
    color: #f472b6;
  }
`;

const TOCDivider = styled.hr`
  margin-top: 1rem;
  border: none;
  border-top: 1px solid #e5e7eb;
  border-top-color: #374151;
`;

const DetailPageLayout = styled.div`
  position: relative;
  color: #374151;
  max-width: none;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  max-width: 750px;
  padding-left: 1.25rem;
  padding-right: 1.25rem;

  @media (min-width: 640px) {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }

  font: var(--Large-Title);
  color: var(--Text-Color);
`;

const HeaderContainer = styled.header`
  margin-top: 7rem;
  text-align: center;
`;

const Title = styled.h1`
  margin-bottom: 1.25rem;
  font-size: 1.125rem;
  line-height: 1.75rem;
  color: var(--Text-Color);
  font: var(--Large-Title);
`;

const CategoryContainer = styled.div`
  margin-bottom: 0.75rem;
  font-size: 1rem;
  line-height: 1.5rem;
`;

const CategoryLink = styled.a`
  font-weight: 600;
  color: #db2777;
  text-decoration: none;
  text-underline-offset: 4px;

  &:hover {
    text-decoration: underline;
  }

  color: #f472b6;
`;

const MetaContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #6b7280;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const CalendarIcon = styled.div`
  width: 0.875rem;
  height: 0.875rem;

  svg {
    width: 100%;
    height: 100%;
  }
`;

const Divider = styled.hr`
  margin-top: 1.25rem;
  border: none;
  border-top: 1px solid #e5e7eb;
  border-top-color: #374151;
`;
