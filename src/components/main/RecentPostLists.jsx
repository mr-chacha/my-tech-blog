import React, {useState} from "react";
import styled from "styled-components";
import reactIcon from "@public/image/png/reactIcon.png";
import {GlobalText} from "@/common/style";

export const RecentPostLists = () => {
  const [recentPostLists, setRecentPostLists] = useState([
    {
      postId: 1,
      category: "Product",
      title: "개발블로그 타이틀",
      content: "개발블로그 컨텐츠",
      createdAt: "2025-01-01",
      updatedAt: "2025-11-01",
      viewCount: 100,
      likeCount: 100,
      commentCount: 100,
      image: reactIcon,
    },
  ]);

  return (
    <RecentLayout>
      <RecentCardSection>
        <RecentTitle>최근 게시물</RecentTitle>
        <RecentLeftCardBox>
          <RecentLeftTopCard src={recentPostLists[0].image ? recentPostLists[0].image : ""} />
          <RecentLeftBottomCard>
            <div style={{display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%"}}>
              <div>
                <GlobalText color="red" font="var(--Headline-M)">
                  {recentPostLists[0].category}
                </GlobalText>
                <GlobalText font="var(--Title)">{recentPostLists[0].title}</GlobalText>
              </div>
              <div style={{display: "flex", alignContent: "center", justifyContent: "space-between"}}>
                <div style={{display: "flex", gap: "5px", alignItems: "center"}}>
                  <div>📆 </div>
                  <div>
                    {recentPostLists[0].updatedAt ? recentPostLists[0].updatedAt : recentPostLists[0].createdAt}
                  </div>
                </div>
                <div style={{display: "flex", gap: "5px", alignItems: "center"}}>
                  <div>👀</div>
                  <div>{recentPostLists[0].viewCount}</div>
                  <div>👍</div>
                  <div>{recentPostLists[0].likeCount}</div>
                </div>
              </div>
            </div>
          </RecentLeftBottomCard>
        </RecentLeftCardBox>
      </RecentCardSection>
      <RecentCardSection></RecentCardSection>
    </RecentLayout>
  );
};

const RecentLeftBottomCard = styled.div`
  width: 100%;
  height: 120px;
  padding: 10px;
`;
const RecentLeftTopCard = styled.img`
  width: 100%;
  height: 290px;
  height: 100%;
  min-height: 290px;
  max-height: 290px;
  background-color: lightcoral;
  border-bottom: 1px solid var(--Border-Color);
  object-fit: cover;
`;
const RecentLeftCardBox = styled.div`
  display: flex;
  flex-direction: column;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.2);
`;

const RecentTitle = styled.h2`
  font: var(--Large-Title);
`;
const RecentCardSection = styled.section`
  display: flex;
  width: 100%;
  min-width: 520px;
  height: 445px;

  flex-direction: column;
`;
const RecentLayout = styled.div`
  width: 100%;
  display: flex;
  gap: 30px;
  margin-top: 24px;
`;
