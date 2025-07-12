import React from "react";
import styled from "styled-components";
import reactIcon from "@public/image/png/reactIcon.png";
export const AboutPage = () => {
  return (
    <Container>
      <FlexContainer>
        <ProfileSection>
          <ProfileInfo>
            <MainTitle>차상현</MainTitle>
            <Description>완벽한 개발자를 꿈꾸는 프론트엔드 개발자</Description>
            <LocationInfo>
              <LocationLink href="https://www.google.com/maps/place/suwon" target="_blank">
                <GlobeIcon>
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                  <path d="M2 12h20"></path>
                </GlobeIcon>
                대한민국 경기도 수원시 (한국 표준시)
              </LocationLink>
            </LocationInfo>
            <SocialLinks>
              <SocialButton href="https://github.com/mr-chacha" target="_blank">
                <GitHubIcon viewBox="0 0 16 16">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                </GitHubIcon>
              </SocialButton>
              <SocialButton href="" target="_blank">
                <LinkedInIcon viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                </LinkedInIcon>
              </SocialButton>
              <EmailButton type="button">
                <MailIcon>
                  <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </MailIcon>
              </EmailButton>
            </SocialLinks>
            <PrintEmailInfo>
              <EmailLink href="">hoitchac@gmail.com</EmailLink>
            </PrintEmailInfo>
          </ProfileInfo>
          <ProfileImage>
            <img alt="이미지" src={reactIcon} />
          </ProfileImage>
        </ProfileSection>
        <AboutSection>
          <AboutTitle>About</AboutTitle>
          <AboutDescription>더 완벽한 더 나은 개발자가 되기 위해 노력하는 개발자입니다.</AboutDescription>
        </AboutSection>
        <WorkExperienceSection>
          <WorkTitle>Work Experience</WorkTitle>
          <WorkContainer>
            <WorkCard>
              <WorkHeader>
                <WorkHeaderTop>
                  <WorkCompany>
                    <CompanyLink href="https://www.preneu.com/kr/index.php" target="_blank">
                      프리뉴
                    </CompanyLink>
                  </WorkCompany>
                  <WorkPeriod>2024.08.01 ~ </WorkPeriod>
                </WorkHeaderTop>
              </WorkHeader>
              <CompanyDescription>드론 제조 및 관련 웹 플랫폼 기업</CompanyDescription>
              <JobTitle>Web Front-end Developer</JobTitle>
              <JobList>
                <JobItem>드론 웹 플랫폼 HUB 개발</JobItem>
                <JobItem>울주 드론 서비스 웹 플랫폼 개발</JobItem>
                <JobItem>어드민 페이지 개발</JobItem>
              </JobList>
            </WorkCard>
          </WorkContainer>
        </WorkExperienceSection>
        <SkillsSection>
          <SkillsTitle>Skills</SkillsTitle>
          <SkillsContainer>
            <SkillBadge>Javascript</SkillBadge>
            <SkillBadge>Typescript</SkillBadge>
            <SkillBadge>React.js</SkillBadge>
            <SkillBadge>Next.js</SkillBadge>
          </SkillsContainer>
        </SkillsSection>
      </FlexContainer>
    </Container>
  );
};

const SkillsSection = styled.section`
  display: flex;
  min-height: 0;
  flex-direction: column;
  gap: 0.75rem 0;
`;

const SkillsTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
`;

const SkillsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
`;

const SkillBadge = styled.div`
  display: inline-flex;
  align-items: center;
  border-radius: 6px;
  border: 1px solid transparent;
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  transition: colors 0.2s;
  background: rgba(59, 130, 246, 0.8);
  color: white;

  &:hover {
    background: rgba(59, 130, 246, 0.6);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }

  @media print {
    font-size: 10px;
  }
`;

const WorkExperienceSection = styled.section`
  display: flex;
  min-height: 0;
  flex-direction: column;
  gap: 0.75rem 0;
`;

const WorkTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
`;

const WorkContainer = styled.div`
  > * + * {
    margin-top: 1rem;
  }
`;

const WorkCard = styled.div`
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
`;

const WorkHeader = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 0.75rem;

  > * + * {
    margin-top: 0.375rem;
  }
`;

const WorkHeaderTop = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.25rem;
  font-size: 1rem;

  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }
`;

const WorkCompany = styled.h3`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1;
`;

const CompanyLink = styled.a`
  &:hover {
    text-decoration: underline;
  }
`;

const WorkPeriod = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-variant-numeric: tabular-nums;
`;

const CompanyDescription = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
`;

const JobTitle = styled.h4`
  margin-top: 1.75rem;
  font-weight: 600;
  line-height: 1;

  @media print {
    font-size: 12px;
  }
`;

const JobList = styled.ul`
  margin-top: 1rem;
  list-style-type: disc;
  font-size: 0.875rem;

  > * + * {
    margin-top: 0.5rem;
  }
`;

const JobItem = styled.li`
  margin-left: 1.25rem;
  color: #6b7280;
`;

const AboutSection = styled.section`
  display: flex;
  min-height: 0;
  flex-direction: column;
  gap: 0.75rem 0;
`;

const AboutTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
`;

const AboutDescription = styled.p`
  line-height: 2rem;
  color: #6b7280;
  white-space: normal;

  @media (min-width: 640px) {
    white-space: pre-wrap;
  }

  @media print {
    font-size: 12px;
  }
`;

const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  position: relative;
  margin-left: auto;
  margin-right: auto;
  scroll-margin-top: 3rem;
  scroll-margin-bottom: 3rem;
  overflow: auto;
  padding: 1.5rem;

  @media (min-width: 640px) {
    padding: 2.25rem;
  }

  @media (min-width: 768px) {
    padding: 4rem;
  }

  @media print {
    padding: 3rem;
    padding-top: 0;
  }
`;

const FlexContainer = styled.div`
  display: flex;
  min-height: 0;
  flex-direction: column;
  gap: 0.75rem 0;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  max-width: 42rem;

  > * + * {
    margin-top: 2rem;
  }

  @media print {
    > * + * {
      margin-top: 1rem;
    }
  }
`;

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  @media (min-width: 640px) {
    flex-direction: row;
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
  text-align: center;

  > * + * {
    margin-top: 0.375rem;
  }

  @media (min-width: 640px) {
    text-align: start;
  }
`;

const MainTitle = styled.h1`
  margin-bottom: 1rem;
  font-size: 1.875rem;
  font-weight: bold;
`;

const Description = styled.p`
  max-width: 28rem;
  color: #6b7280;

  @media print {
    font-size: 12px;
  }
`;

const LocationInfo = styled.p`
  max-width: 28rem;
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #6b7280;
`;

const LocationLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  line-height: 1;

  &:hover {
    text-decoration: underline;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding-top: 0.25rem;
  font-size: 0.875rem;
  color: #6b7280;

  @media (min-width: 640px) {
    justify-content: flex-start;
  }

  @media print {
    display: none;
  }
`;

const SocialButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: colors 0.2s;
  outline: 1px solid #e5e7eb;
  background: white;
  aspect-ratio: 1;
  padding: 0.5rem;
  width: 2rem;
  height: 2rem;

  &:hover {
    background: #f3f4f6;
  }

  &:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
`;

const EmailButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: colors 0.2s;
  outline: 1px solid #e5e7eb;
  background: white;
  aspect-ratio: 1;
  padding: 0.5rem;
  width: 2rem;
  height: 2rem;
  border: none;
  cursor: pointer;

  &:hover {
    background: #f3f4f6;
  }

  &:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
`;

const PrintEmailInfo = styled.div`
  display: none;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #6b7280;

  @media print {
    display: flex;
    font-size: 12px;
  }
`;

const EmailLink = styled.a`
  text-decoration: underline;
`;

const ProfileImage = styled.span`
  position: relative;
  display: flex;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 0.75rem;
  width: 7rem;
  height: 7rem;

  img {
    aspect-ratio: 1;
    height: 100%;
    width: 100%;
    object-fit: cover;
  }
`;

const GlobeIcon = styled.svg.attrs({
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
})`
  width: 0.75rem;
  height: 0.75rem;
`;

const GitHubIcon = styled.svg.attrs({
  fill: "currentColor",
  width: "1em",
  height: "1em",
})`
  width: 1rem;
  height: 1rem;
`;

const LinkedInIcon = styled.svg.attrs({
  fill: "currentColor",
  width: "1em",
  height: "1em",
})`
  width: 1rem;
  height: 1rem;
`;

const MailIcon = styled.svg.attrs({
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
})`
  width: 1rem;
  height: 1rem;
`;

export default Container;
