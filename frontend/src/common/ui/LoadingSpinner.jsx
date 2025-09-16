import {useZustandStore} from "frontend/src/common/store";
import React from "react";
import styled, {keyframes} from "styled-components";

export const LoadingSpinner = ({message = "로딩 중..."}) => {
  const {isLoading} = useZustandStore();
  if (!isLoading) {
    return null;
  }
  return (
    <LoadingContainer>
      <SpinnerContainer>
        <DotSpinner>
          <Dot delay="0s" />
          <Dot delay="0.1s" />
          <Dot delay="0.2s" />
          <Dot delay="0.3s" />
        </DotSpinner>
        <LoadingText>{message}</LoadingText>
      </SpinnerContainer>
    </LoadingContainer>
  );
};

// 도트 애니메이션
const bounce = keyframes`
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
`;

const LoadingContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 3rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);

  @media (prefers-color-scheme: dark) {
    background: rgba(31, 41, 55, 0.95);
    border: 1px solid rgba(55, 65, 81, 0.3);
  }
`;

const DotSpinner = styled.div`
  display: flex;
  gap: 8px;
`;

const Dot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(45deg, #6366f1, #8b5cf6);
  animation: ${bounce} 1.4s infinite both;
  animation-delay: ${(props) => props.delay};
`;

const LoadingText = styled.div`
  color: #374151;
  font-size: 1.1rem;
  font-weight: 500;
  text-align: center;

  @media (prefers-color-scheme: dark) {
    color: #f9fafb;
  }
`;
