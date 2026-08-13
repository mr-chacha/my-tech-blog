"use client";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useRouter } from "next/navigation";
import { useBlogApis } from "@/common/apis";
import { useZustandStore } from "@/common/store";

const DEFAULT_IMAGE = "/chacha-dev.png";
const FILTERS = [
  { key: "all", label: "All" },
  { key: "web", label: "Web" },
  { key: "app", label: "App" },
];

export default function PortfolioPage() {
  const router = useRouter();
  const { fetchPortfolio, deletePortfolio } = useBlogApis();
  const { userInfo, setIsLoading, setActiveModal, setModalMessage, setModalConfirmHandler } =
    useZustandStore();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");

  const loadItems = async () => {
    try {
      setIsLoading(true);
      const data = await fetchPortfolio();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("포트폴리오 조회 실패:", error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleDelete = (item) => {
    setModalMessage({
      topMessage: "포트폴리오 삭제",
      bottomMessage: `"${item.title}" 항목을 삭제할까요?`,
    });
    setModalConfirmHandler(() => confirmDelete(item));
    setActiveModal({ twoButtonModal: true });
  };

  const confirmDelete = async (item) => {
    try {
      setIsLoading(true);
      await deletePortfolio(item.id);
      setItems((prev) => prev.filter((p) => p.id !== item.id));
      setActiveModal({ twoButtonModal: false });
    } catch (error) {
      console.error("삭제 실패:", error);
      setActiveModal({ twoButtonModal: false, oneButtonModal: true });
      setModalMessage({
        topMessage: "삭제 실패",
        bottomMessage: "잠시 후 다시 시도해주세요.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isDirectDownload = (item) => {
    const link = getActionUrl(item);
    if (item.type !== "app" || !link) return false;
    return /\.(apk|ipa|aab)(\?|$)/i.test(link);
  };

  const getActionUrl = (item) => {
    if (item.type === "app") {
      return item.downloadUrl || item.url || "";
    }
    return item.url || "";
  };

  const getCount = (key) => {
    if (key === "all") return items.length;
    return items.filter((item) => item.type === key).length;
  };

  const filteredItems = filter === "all" ? items : items.filter((item) => item.type === filter);

  return (
    <Page>
      <PageHeader>
        <TitleBlock>
          <PageTitle>Portfolio</PageTitle>
          <PageDesc>지금까지 만든 웹과 앱을 소개합니다.</PageDesc>
        </TitleBlock>
        {userInfo && (
          <AddButton type="button" onClick={() => router.push("/portfolio/form")}>
            등록하기
          </AddButton>
        )}
      </PageHeader>

      {items.length > 0 && (
        <TabList role="tablist" aria-label="포트폴리오 유형 필터">
          {FILTERS.map((tab) => (
            <Tab
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={filter === tab.key}
              $active={filter === tab.key}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
              <TabCount $active={filter === tab.key}>{getCount(tab.key)}</TabCount>
            </Tab>
          ))}
        </TabList>
      )}

      {items.length === 0 ? (
        <Empty>
          <EmptyIcon>📁</EmptyIcon>
          <EmptyTitle>등록된 포트폴리오가 없습니다</EmptyTitle>
          {userInfo && <EmptyText>등록하기 버튼으로 첫 항목을 추가해보세요.</EmptyText>}
        </Empty>
      ) : filteredItems.length === 0 ? (
        <Empty>
          <EmptyTitle>해당 유형의 항목이 없습니다</EmptyTitle>
          <EmptyText>다른 탭을 선택해보세요.</EmptyText>
        </Empty>
      ) : (
        <Grid>
          {filteredItems.map((item) => {
            const actionUrl = getActionUrl(item);
            const isApp = item.type === "app";

            return (
            <Card
              key={item.id}
              $clickable={Boolean(actionUrl)}
              onClick={() => {
                if (!actionUrl) return;
                window.open(actionUrl, "_blank", "noopener,noreferrer");
              }}
              role={actionUrl ? "link" : undefined}
              tabIndex={actionUrl ? 0 : undefined}
              onKeyDown={(e) => {
                if (!actionUrl) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  window.open(actionUrl, "_blank", "noopener,noreferrer");
                }
              }}
            >
              <ThumbWrap>
                <Thumb src={item.image || DEFAULT_IMAGE} alt={item.title} />
              </ThumbWrap>
              <CardBody>
                <CardTitle>{item.title}</CardTitle>
                <CardDesc>{item.description}</CardDesc>
                <Actions onClick={(e) => e.stopPropagation()}>
                  {actionUrl && (
                    <PrimaryLink
                      href={actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={isDirectDownload(item) || undefined}
                    >
                      {isApp ? "앱 다운로드" : "사이트 보기"}
                    </PrimaryLink>
                  )}
                  {item.githubUrl && (
                    <SecondaryLink href={item.githubUrl} target="_blank" rel="noopener noreferrer">
                      GitHub
                    </SecondaryLink>
                  )}
                </Actions>
                {userInfo && (
                  <AdminActions onClick={(e) => e.stopPropagation()}>
                    <AdminBtn type="button" onClick={() => router.push(`/portfolio/form?id=${item.id}`)}>
                      수정
                    </AdminBtn>
                    <AdminBtn type="button" $danger onClick={() => handleDelete(item)}>
                      삭제
                    </AdminBtn>
                  </AdminActions>
                )}
              </CardBody>
            </Card>
            );
          })}
        </Grid>
      )}
    </Page>
  );
}

const Page = styled.section`
  width: 100%;
  padding: 2rem 1rem 4rem;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const PageTitle = styled.h1`
  font: var(--Large-Title);
  color: var(--Text-Color);
`;

const PageDesc = styled.p`
  font: var(--Body-R);
  color: var(--Brand-Colors-Two);
`;

const AddButton = styled.button`
  flex-shrink: 0;
  height: 40px;
  padding: 0 1rem;
  border: none;
  border-radius: 8px;
  background: var(--Brand-Colors);
  color: #fff;
  font: var(--Body-B);
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

const TabList = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const Tab = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 36px;
  padding: 0 0.9rem;
  border-radius: 8px;
  border: 1px solid ${(props) => (props.$active ? "var(--Brand-Colors)" : "var(--Border-Color)")};
  background: ${(props) => (props.$active ? "var(--Brand-Colors)" : "transparent")};
  color: ${(props) => (props.$active ? "#fff" : "var(--Text-Color)")};
  font: var(--Body-B);
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;

  &:hover {
    border-color: var(--Brand-Colors);
  }
`;

const TabCount = styled.span`
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.35rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font: var(--Caption-B);
  background: ${(props) => (props.$active ? "rgba(255,255,255,0.25)" : "var(--Code-Back-Color)")};
  color: ${(props) => (props.$active ? "#fff" : "var(--Brand-Colors-Two)")};
`;

const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
  text-align: center;
  color: var(--Brand-Colors-Two);
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 0.75rem;
`;

const EmptyTitle = styled.h2`
  font: var(--Title);
  color: var(--Text-Color);
  margin-bottom: 0.35rem;
`;

const EmptyText = styled.p`
  font: var(--Body-R);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.article`
  display: flex;
  flex-direction: column;
  border: 1px solid var(--Border-Color);
  border-radius: 12px;
  overflow: hidden;
  background: var(--Back-Color);
  cursor: ${(props) => (props.$clickable ? "pointer" : "default")};
  transition: border-color 0.15s ease, transform 0.15s ease;

  ${(props) =>
    props.$clickable &&
    `
    &:hover {
      border-color: var(--Brand-Colors);
      transform: translateY(-2px);
    }
  `}
`;

const ThumbWrap = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  background: var(--Code-Back-Color);
  overflow: hidden;
`;

const Thumb = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 1.1rem 1.25rem;
  flex: 1;
`;

const CardTitle = styled.h2`
  font: var(--Title);
  color: var(--Text-Color);
`;

const CardDesc = styled.p`
  font: var(--Body-R);
  color: var(--Brand-Colors-Two);
  line-height: 1.5;
  flex: 1;
  white-space: pre-wrap;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const PrimaryLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 0.9rem;
  border-radius: 8px;
  background: var(--Brand-Colors);
  color: #fff;
  font: var(--Body-B);
  text-decoration: none;

  &:hover {
    opacity: 0.9;
  }
`;

const SecondaryLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 0.9rem;
  border-radius: 8px;
  border: 1px solid var(--Border-Color);
  color: var(--Text-Color);
  font: var(--Body-M);
  text-decoration: none;

  &:hover {
    background: var(--Code-Back-Color);
  }
`;

const AdminActions = styled.div`
  display: flex;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--Border-Color);
`;

const AdminBtn = styled.button`
  height: 32px;
  padding: 0 0.75rem;
  border-radius: 6px;
  border: 1px solid ${(props) => (props.$danger ? "#ef4444" : "var(--Border-Color)")};
  background: transparent;
  color: ${(props) => (props.$danger ? "#ef4444" : "var(--Text-Color)")};
  font: var(--Caption-M);
  cursor: pointer;

  &:hover {
    background: var(--Code-Back-Color);
  }
`;
