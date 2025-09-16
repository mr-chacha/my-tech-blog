import React from "react";
import styled from "styled-components";
import {useNavigate} from "react-router-dom";

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Content>
        <Title>404</Title>
        <Message>페이지를 찾을 수 없습니다</Message>
        <Description>요청하신 페이지가 존재하지 않습니다.</Description>
        <HomeButton onClick={() => navigate("/")}>홈으로 돌아가기</HomeButton>
      </Content>
    </Container>
  );
};

const Container = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
`;

const Content = styled.div`
  max-width: 400px;
`;

const Title = styled.h1`
  font-size: 8rem;
  font-weight: 900;
  color: #3b82f6;
  margin: 0;
`;

const Message = styled.h2`
  font-size: 1.5rem;
  color: var(--Text-Color);
  margin: 1rem 0;
`;

const Description = styled.p`
  color: #6b7280;
  margin: 1rem 0 2rem 0;
`;

const HomeButton = styled.button`
  padding: 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: var(--Title);
  cursor: pointer;
  transition: background-color 0.2s;

  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  &:hover {
    background: #2563eb;
  }
`;
