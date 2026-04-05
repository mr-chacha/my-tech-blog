"use client";
import { useZustandStore } from "@/common/store";
import { FooterGitHubSVG, FooterLinkdIn } from "@/components/icons";
import React from "react";
import styled from "styled-components";

export const Footer = () => {
  const { isDarkMode } = useZustandStore();
  return (
    <FooterContainer $isDarkMode={isDarkMode}>
      <SocialLinksContainer>
        <SocialLink href="https://github.com/mr-chacha" target="_blank">
          <GitHubIcon>
            <FooterGitHubSVG color={isDarkMode ? "#fff" : "#000"} />
          </GitHubIcon>
        </SocialLink>
        <SocialLink href="https://www.linkedin.com/in/%EC%83%81%ED%98%84-%EC%B0%A8-b722a837b/" target="_blank">
          <LinkedInIcon>
            <FooterLinkdIn />
          </LinkedInIcon>
        </SocialLink>
      </SocialLinksContainer>

      <CopyrightText $isDarkMode={isDarkMode}>
        © 2025. <AuthorName>Cha Cha</AuthorName> all rights reserved.
      </CopyrightText>
    </FooterContainer>
  );
};

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

const SocialLinksContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const SocialLink = styled.a`
  text-decoration: none;
  color: inherit;
`;

const IconBase = styled.div`
  transition: color 0.3s ease;

  svg {
    width: 30px;
    height: 30px;
  }
`;

const GitHubIcon = styled(IconBase)``;
const LinkedInIcon = styled(IconBase)``;

const CopyrightText = styled.div`
  color: ${(props) => (props.$isDarkMode ? "#fff" : "#000")};
`;

const AuthorName = styled.span`
  font-weight: 600;
`;
