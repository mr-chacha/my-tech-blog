import {useZustandStore} from "@/common/store";
import {FooterGitHubSVG} from "@public/Icon";
import React from "react";
import styled from "styled-components";

export const Footer = () => {
  const {isDarkMode} = useZustandStore();
  return (
    <FooterContainer $isDarkMode={isDarkMode}>
      <SocialLinksContainer>
        <SocialLink href="https://github.com/mr-chacha" target="_blank">
          <GitHubIcon>
            <FooterGitHubSVG color={isDarkMode ? "#fff" : "#000"} />
          </GitHubIcon>
        </SocialLink>
        {/* <SocialLink href="https://www.linkedin.com/in/dohkim777" target="_blank">
          <LinkedInIcon>
            <svg viewBox="0 0 24 24" fill="currentColor" height="30" width="30">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
            </svg>
          </LinkedInIcon>
        </SocialLink> */}
      </SocialLinksContainer>

      <CopyrightText $isDarkMode={isDarkMode}>
        © 2025. <AuthorName>Cha Cha</AuthorName> all rights reserved.
      </CopyrightText>
    </FooterContainer>
  );
};

// Footer 컨테이너
const FooterContainer = styled.footer`
  margin-bottom: 4rem;
  margin-top: 5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  text-align: center;
  color: #000;
  background-color: ${(props) => (props.$isDarkMode ? "#1a1a1a" : "#fff")};

  @media print {
    display: none;
  }
`;

// 소셜 링크 컨테이너
const SocialLinksContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

// 소셜 링크 공통 스타일
const SocialLink = styled.a`
  text-decoration: none;
  color: inherit;
`;

// 아이콘 공통 스타일
const IconBase = styled.div`
  /* color: #000; */
  transition: color 0.3s ease;

  svg {
    width: 30px;
    height: 30px;
  }

  /* 다크모드 지원 */
  [data-theme="dark"] & {
    color: #fff;
  }
`;

const GitHubIcon = styled(IconBase)``;

const LinkedInIcon = styled(IconBase)``;

// 저작권 텍스트
const CopyrightText = styled.div`
  color: ${(props) => (props.$isDarkMode ? "#fff" : "#000")};
`;

// 작성자 이름
const AuthorName = styled.span`
  font-weight: 600;
`;
