import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import styled from "styled-components";
import remarkBreaks from "remark-breaks";
import {useBlogApis} from "@/common/apis";
import {useParams} from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {useNavigate} from "react-router-dom";
import {formatTimestamp} from "@/common/util";
import {useZustandStore} from "@/common/store";
import React, {useState, useEffect} from "react";
import {CalendarSVG, LinkCopySVG, ReplySVG, ScrollTopSVG} from "@public/Icon";
import {MarkDownContent} from "@/components/layout";

export const DetailPage = () => {
  const {detailId} = useParams();
  const navigate = useNavigate();
  const {fetchDetailPost, deletePost} = useBlogApis();
  const {userInfo, setActiveModal, setModalMessage, setModalButton, setModalConfirmHandler, setIsLoading} =
    useZustandStore();

  const [detailPost, setDetailPost] = useState("");
  const [tocItems, setTocItems] = useState([]);
  // toc 활성화 상태
  const [activeId, setActiveId] = useState("");
  const [isScrollingToTarget, setIsScrollingToTarget] = useState(false); // 추가

  // 사이드바 링크 클릭 시 해당 섹션으로 스크롤
  const handleTocClick = (e, href) => {
    e.preventDefault();
    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      setIsScrollingToTarget(true);

      const headerOffset = 200;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // 스크롤 완료 감지를 위한 함수
      const checkScrollComplete = () => {
        const currentScroll = window.scrollY;
        const targetScroll = offsetPosition;
        const tolerance = 5; // 오차 허용 범위

        if (Math.abs(currentScroll - targetScroll) <= tolerance) {
          // 스크롤 완료 시 해당 위치에서 정확한 활성화 상태 계산
          const scrollPosition = currentScroll + 200;
          let activeIds = [];

          let currentActiveItem = null;

          for (let i = 0; i < tocItems.length; i++) {
            const element = document.getElementById(tocItems[i].id);
            if (element) {
              const elementTop = element.offsetTop;

              if (elementTop <= scrollPosition) {
                currentActiveItem = tocItems[i];
              } else {
                break;
              }
            }
          }

          if (currentActiveItem) {
            activeIds = getCurrentAndParentH1(tocItems, currentActiveItem);
          }

          setActiveId(activeIds.join(","));
          setIsScrollingToTarget(false);
        } else {
          requestAnimationFrame(checkScrollComplete);
        }
      };

      setTimeout(() => {
        checkScrollComplete();
      }, 100);
    }
  };

  const getCurrentAndParentH1 = (items, currentItem) => {
    const activeIds = [];
    const currentIndex = items.findIndex((item) => item.id === currentItem.id);

    if (currentIndex === -1) return [currentItem.id];

    activeIds.push(currentItem.id);

    if (currentItem.level !== 1) {
      for (let i = currentIndex - 1; i >= 0; i--) {
        const item = items[i];

        if (item.level === 1) {
          if (item.id !== currentItem.id) {
            activeIds.unshift(item.id);
          }
          break;
        }
      }
    }

    return activeIds;
  };

  // 스크롤
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

  // h1~h4 태그를 추출해서 toc를 만드는 함수
  const tocFromMarkdown = (markdownContent) => {
    if (!markdownContent) return [];
    // 블록쿼트 안의 헤딩도 인식하도록 정규식 수정
    const headingRegex = /^(?:>\s*)?(#{1,4})\s+(.+)$/gm;
    const headings = [];
    const titleCounts = {};
    let match;

    while ((match = headingRegex.exec(markdownContent)) !== null) {
      const level = match[1].length;
      let title = match[2].trim();

      // 타이틀에 이미지 url 제거
      title = title.replace(/!\[[^\]]*\]\([^)]*\)/g, "");
      title = title.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
      title = title.replace(/\*\*([^*]+)\*\*/g, "$1");
      title = title.replace(/\*([^*]+)\*/g, "$1");
      title = title.replace(/`([^`]+)`/g, "$1");
      title = title.trim();

      const baseId = title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\u3131-\uD79D-]/g, "")
        .replace(/--+/g, "-")
        .replace(/^-|-$/g, "");

      let uniqueId = baseId;
      if (titleCounts[baseId]) {
        titleCounts[baseId]++;
        uniqueId = `${baseId}-${titleCounts[baseId]}`;
      } else {
        titleCounts[baseId] = 1;
      }

      const href = `#${uniqueId}`;

      headings.push({
        title,
        href,
        isSubItem: level > 1,
        id: uniqueId,
        level,
      });
    }

    return headings;
  };

  // 상세 포스트 가져오기 API
  const getDetailPost = async (detailId) => {
    try {
      const response = await fetchDetailPost(detailId);
      setDetailPost(response);

      const contentToc = tocFromMarkdown(response.content);
      setTocItems(contentToc);
    } catch (error) {
      console.error("포스트 가져오기 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = () => {
    setActiveModal({twoButtonModal: true});
    setModalMessage({
      topMessage: "정말로 이 포스트를 삭제하시겠습니까?",
      bottomMessage: "이 작업은 되돌릴 수 없습니다.",
    });
    setModalButton({
      cancelButton: "취소",
      confirmButton: "삭제",
    });
    setModalConfirmHandler(() => confirmDelete());
  };

  // 삭제 확인
  const confirmDelete = async () => {
    try {
      await deletePost(detailId);
      setActiveModal({twoButtonModal: false});
      setModalMessage({
        topMessage: "포스트가 성공적으로 삭제되었습니다.",
        bottomMessage: "",
      });
      setModalButton({
        cancelButton: "",
        confirmButton: "확인",
      });
      setModalConfirmHandler(() => () => {
        setActiveModal({oneButtonModal: false});
        navigate("/");
      });
      setActiveModal({oneButtonModal: true});
      navigate("/");
    } catch (error) {
      console.error("삭제 오류:", error);
      setActiveModal({twoButtonModal: false});
      setModalMessage({
        topMessage: "삭제 중 오류가 발생했습니다.",
        bottomMessage: "다시 시도해주세요.",
      });
      setModalButton({
        cancelButton: "",
        confirmButton: "확인",
      });
      setModalConfirmHandler(() => () => setActiveModal({oneButtonModal: false}));
      setActiveModal({oneButtonModal: true});
    }
  };

  // 포스트 수정 핸들러
  const handleEditPost = () => {
    navigate(`/form?id=${detailId}`);
  };

  useEffect(() => {
    if (detailId) {
      setIsLoading(true);
      getDetailPost(detailId);
    }
  }, [detailId]);

  // 현재 스크롤 위치를 감지해 toc의 활성화 상태관리
  useEffect(() => {
    const handleScroll = () => {
      // 클릭으로 스크롤 중이면 스크롤 감지 무시
      if (isScrollingToTarget || tocItems.length === 0) return;

      const scrollPosition = window.scrollY + 200;
      let activeIds = [];

      if (scrollPosition < 300) {
        activeIds = [tocItems[0]?.id].filter(Boolean);
      } else {
        let currentActiveItem = null;

        for (let i = 0; i < tocItems.length; i++) {
          const element = document.getElementById(tocItems[i].id);
          if (element) {
            const elementTop = element.offsetTop;

            if (elementTop <= scrollPosition) {
              currentActiveItem = tocItems[i];
            } else {
              break;
            }
          }
        }

        if (currentActiveItem) {
          activeIds = getCurrentAndParentH1(tocItems, currentActiveItem);
        }
      }

      setActiveId(activeIds.join(","));
    };

    let timeoutId;
    const throttledHandleScroll = () => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        handleScroll();
        timeoutId = null;
      }, 50);
    };

    if (tocItems.length > 0) {
      window.addEventListener("scroll", throttledHandleScroll);
      handleScroll();
    }

    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [tocItems, isScrollingToTarget]);

  return (
    <DetailPageLayout>
      {/* 헤더 */}
      <HeaderSection>
        <Title>{detailPost.title}</Title>

        <CategoryBox>
          <CategoryText>{detailPost.category}</CategoryText>
        </CategoryBox>

        <PostTimeSection>
          <PostTimeBox>
            <CalendarIcon>
              <CalendarSVG />
            </CalendarIcon>
            <div>{formatTimestamp(detailPost.createdAt)}</div>
          </PostTimeBox>
        </PostTimeSection>

        {/* 관리자일 때만 수정/삭제 버튼 표시 */}
        {userInfo && (
          <AdminButtonSection>
            <EditButton onClick={handleEditPost}>수정</EditButton>
            <DeleteButton onClick={handleDeletePost}>삭제</DeleteButton>
          </AdminButtonSection>
        )}
        <HeaderHr />
      </HeaderSection>

      {/* 반응형일때 보여지는 네브 */}
      <MobileNavSection>
        <MobileNavTitle>On this page</MobileNavTitle>
        <MobileNavList>
          {tocItems.map((item, index) => (
            <MobileNavItem key={index} $isSubItem={item.isSubItem}>
              <MobileNavLink
                href={item.href}
                $isActive={activeId.split(",").includes(item.id)}
                onClick={(e) => handleTocClick(e, item.href)}
              >
                {item.title}
              </MobileNavLink>
            </MobileNavItem>
          ))}
        </MobileNavList>
        <MobileNavHr />
      </MobileNavSection>

      <DetailBodySection>
        <SidebarLayout>
          <SidebarSection>
            <SidebarContainer>
              <SidebarTitle>On this page</SidebarTitle>
              <SidebarList>
                {tocItems.map((item, index) => (
                  <SidebarItem key={index} $isSubItem={item.isSubItem}>
                    <SidebarLink
                      href={item.href}
                      $isActive={activeId.split(",").includes(item.id)}
                      onClick={(e) => handleTocClick(e, item.href)}
                    >
                      {item.title}
                    </SidebarLink>
                  </SidebarItem>
                ))}
              </SidebarList>
            </SidebarContainer>

            <ActionButtonsContainer>
              <ActionButton onClick={scrollToTop} title="맨 위로">
                <ScrollTopSVG />
              </ActionButton>

              <ActionButton onClick={handleComment} title="댓글">
                <ReplySVG />
              </ActionButton>

              <ActionButton onClick={handleCopy} title="링크 복사">
                <LinkCopySVG />
              </ActionButton>
            </ActionButtonsContainer>
          </SidebarSection>
        </SidebarLayout>
        <MarkDownContent content={detailPost?.content} tempFiles={[]} isPreview={false} />
      </DetailBodySection>
    </DetailPageLayout>
  );
};

const AdminButtonSection = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 1rem;
`;

const EditButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: var(--Brand-Colors);
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2563eb;
  }
`;

const DeleteButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #dc2626;
  }
`;

const DetailBodySection = styled.article``;
const SidebarLayout = styled.aside`
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

const SidebarSection = styled.div`
  position: sticky;
  bottom: 0;
  top: 200px;
  z-index: 10;
  margin-left: 5rem;
  margin-top: 200px;
  width: 200px;
`;

const SidebarContainer = styled.div`
  margin-bottom: 1rem;
  border-left: 1px solid #e5e7eb;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  border-left-color: #374151;
`;

const SidebarTitle = styled.div`
  margin-bottom: 0.25rem;
  font-weight: 700;

  color: var(--Text-Color);
`;

const SidebarList = styled.ul`
  font-size: 0.75rem;
  line-height: 1rem;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const SidebarItem = styled.li`
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  transition: all 0.2s ease;
  margin-left: ${(props) => (props.$isSubItem ? "1rem" : "0")};
`;

const SidebarLink = styled.a`
  color: ${(props) => (props.$isActive ? "#f472b6" : "#9ca3af")};
  text-decoration: none;
  transition: color 0.2s ease;
  font-weight: ${(props) => (props.$isActive ? "600" : "400")};

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

const MobileNavSection = styled.nav`
  @media (min-width: 1280px) {
    display: none;
  }
`;

const MobileNavTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--Text-Color);
  font: var(--Title);
`;

const MobileNavList = styled.ul`
  margin: 0;
  padding: 0;
  padding-left: 1.5rem;
  list-style: disc;
  font: var(--Body-M);

  ::marker {
    color: ${(props) => (props.$isDarkMode ? "#4b5563" : "#d1d5db")};
  }
`;

const MobileNavItem = styled.li`
  margin-top: 0;
  margin-bottom: 0;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  margin-left: ${(props) => (props.$isSubItem ? "1rem" : "0")};
`;

const MobileNavLink = styled.a`
  color: ${(props) => (props.$isActive ? "#f472b6" : "var(--Text-Color)")};
  text-decoration: none;
  text-underline-offset: 4px;
  border-bottom: 1px solid ${(props) => (props.$isActive ? "#f472b6" : "var(--Text-Color)")};
  font-weight: ${(props) => (props.$isActive ? "600" : "400")};

  &:hover {
    color: #f472b6;
  }
`;

const MobileNavHr = styled.hr`
  margin-top: 1rem;
  border: none;
  border-top: 1px solid #e5e7eb;
  border-top-color: #374151;
`;

const Title = styled.h1`
  margin-bottom: 1.25rem;
  font-size: 1.125rem;
  line-height: 1.75rem;
  color: var(--Text-Color);
  font: var(--Large-Title);
`;

const CategoryBox = styled.div`
  margin-bottom: 0.75rem;
  font-size: 1rem;
  line-height: 1.5rem;
`;

const CategoryText = styled.div`
  font-weight: 600;
  color: #db2777;
  text-decoration: none;
  text-underline-offset: 4px;

  &:hover {
    text-decoration: underline;
  }
`;

const PostTimeSection = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #6b7280;
`;

const PostTimeBox = styled.div`
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

const HeaderHr = styled.hr`
  margin-top: 1.25rem;
  border: none;
  border-top: 1px solid #e5e7eb;
  border-top-color: #374151;
`;

const HeaderSection = styled.header`
  margin-top: 7rem;
  text-align: center;
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
  color: var(--Text-Color);

  @media (min-width: 640px) {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
`;
