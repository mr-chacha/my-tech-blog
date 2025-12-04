import React from "react";
import styled from "styled-components";
import {useZustandStore} from "@/common/store";
import defaultImage from "@public/chacha-dev.png";
import {getCurrentURL, useSEO} from "@/common/seo";

export const AboutPage = () => {
  useSEO({
    title: "어바웃 차차",
    description: "프론트엔드 개발자 차차의 기술 블로그입니다",
    keywords: "개발블로그, React, JavaScript, TypeScript, CSS, 프론트엔드, 웹개발, 차차",
    image: "https://chacha-dev.com/chacha-dev.png",
    url: getCurrentURL(),
    type: "website",
  });

  const {setActiveModal, setModalMessage} = useZustandStore();
  const handleEmailCopy = async () => {
    try {
      await navigator.clipboard.writeText("hoitcha@gmail.com");

      setActiveModal({oneButtonModal: true});
      setModalMessage({
        topMessage: "이메일이 복사 성공",
        bottomMessage: "hoitchac@gmail.com가 복사 되었습니다",
      });
    } catch (err) {
      console.error("복사 실패:", err);
      setActiveModal({oneButtonModal: true});
      setModalMessage({
        topMessage: "이메일이 복사 실패",
        bottomMessage: "이메일 : hoitchac@gmail.com",
      });
    }
  };

  return (
    <Container>
      <FlexContainer>
        {/* 프로필 섹션 */
        <ProfileSection>
          <ProfileImageWrapper>
            <ProfileImage>
              <img alt="차상현 프로필" src={defaultImage} />
            </ProfileImage>
            <ImageGlow />
          </ProfileImageWrapper>
          <ProfileInfo>
            <MainTitle>
              <TitleHighlight>차상현</TitleHighlight>
            </MainTitle>
            <Description>완벽한 개발자를 꿈꾸는 프론트엔드 개발자</Description>
            <LocationInfo>
              <LocationLink href="https://www.google.com/maps/place/suwon" target="_blank" rel="noopener noreferrer">
                <GlobeIcon>
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                  <path d="M2 12h20"></path>
                </GlobeIcon>
                대한민국 경기도 수원시 (한국 표준시)
              </LocationLink>
            </LocationInfo>
            <SocialLinks>
              <SocialButton
                href="https://github.com/mr-chacha"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <GitHubIcon viewBox="0 0 16 16">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                </GitHubIcon>
              </SocialButton>
              <SocialButton
                href="https://www.linkedin.com/in/%EC%83%81%ED%98%84-%EC%B0%A8-b722a837b/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <LinkedInIcon viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                </LinkedInIcon>
              </SocialButton>
              <EmailButton type="button" onClick={handleEmailCopy} aria-label="이메일 복사">
                <MailIcon>
                  <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </MailIcon>
              </EmailButton>
            </SocialLinks>
            <PrintEmailInfo>
              <EmailLink href="mailto:hoitchac@gmail.com">hoitchac@gmail.com</EmailLink>
            </PrintEmailInfo>
          </ProfileInfo>
        </ProfileSection>

        {/* About 섹션 */}
        <AboutSection>
          <SectionHeader>
            <SectionTitle>About</SectionTitle>
            <SectionDivider />
          </SectionHeader>
          <AboutDescription>
            더 완벽한 더 나은 개발자가 되기 위해 노력하는 개발자입니다.
            <br />
            사용자 경험을 중시하며, 깔끔하고 효율적인 코드를 작성하는 것을 좋아합니다.
          </AboutDescription>
        </AboutSection>

        {/* Work Experience 섹션 */}
        <WorkExperienceSection>
          <SectionHeader>
            <SectionTitle>Work Experience</SectionTitle>
            <SectionDivider />
          </SectionHeader>
          <WorkContainer>
            <WorkCard>
              <WorkCardHeader>
                <WorkHeaderTop>
                  <WorkCompany>
                    <CompanyLink href="https://www.preneu.com/kr/index.php" target="_blank" rel="noopener noreferrer">
                      프리뉴
                    </CompanyLink>
                    <CompanyBadge>현재</CompanyBadge>
                  </WorkCompany>
                  <WorkPeriod>2024.08.01 ~ </WorkPeriod>
                </WorkHeaderTop>
              </WorkCardHeader>
              <CompanyDescription>드론 제조 및 관련 웹 플랫폼 기업</CompanyDescription>
              <JobTitle>Web Front-end Developer</JobTitle>
              <JobList>
                <JobItem>
                  <JobItemIcon>▸</JobItemIcon>
                  <span>드론 웹 플랫폼 HUB 개발</span>
                </JobItem>
                <JobItem>
                  <JobItemIcon>▸</JobItemIcon>
                  <span>울주 드론 서비스 웹 플랫폼 개발</span>
                </JobItem>
                <JobItem>
                  <JobItemIcon>▸</JobItemIcon>
                  <span>어드민 페이지 개발</span>
                </JobItem>
              </JobList>
            </WorkCard>
          </WorkContainer>
        </WorkExperienceSection>

        {/* Skills 섹션 */}
        <SkillsSection>
          <SectionHeader>
            <SectionTitle>Skills</SectionTitle>
            <SectionDivider />
          </SectionHeader>
          <SkillsContainer>
            <SkillBadge>Javascript</SkillBadge>
            <SkillBadge>Typescript</SkillBadge>
            <SkillBadge>React.js</SkillBadge>
            <SkillBadge>Next.js</SkillBadge>
            <SkillBadge>CSS</SkillBadge>
            <SkillBadge>HTML</SkillBadge>
            <SkillBadge>Git</SkillBadge>
            <SkillBadge>Webpack</SkillBadge>
          </SkillsContainer>
        </SkillsSection>
      </FlexContainer>
    </Container>
  );
};

// 스타일 컴포넌트
const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  position: relative;
  margin-left: auto;
  margin-right: auto;
  padding: 2rem 1.5rem;
  color: var(--Text-Color);

  @media (min-width: 640px) {
    padding: 3rem 2.25rem;
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
  flex-direction: column;
  gap: 3rem;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  max-width: 42rem;

  @media print {
    gap: 1.5rem;
  }
`;

// 프로필 섹션
const ProfileSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%);
  border: 1px solid rgba(59, 130, 246, 0.1);
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(59, 130, 246, 0.2);
    box-shadow: 0 10px 30px rgba(59, 130, 246, 0.1);
  }

  @media (min-width: 640px) {
    flex-direction: row;
    align-items: flex-start;
    padding: 2.5rem;
  }
`;

const ProfileImageWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const ProfileImage = styled.div`
  position: relative;
  width: 8rem;
  height: 8rem;
  border-radius: 1rem;
  overflow: hidden;
  border: 3px solid rgba(59, 130, 246, 0.2);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (min-width: 640px) {
    width: 10rem;
    height: 10rem;
  }
`;

const ImageGlow = styled.div`
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;

  ${ProfileImageWrapper}:hover & {
    opacity: 1;
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (min-width: 640px) {
    text-align: left;
    gap: 0.75rem;
  }
`;

const MainTitle = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #3b82f6 0%, #9333ea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (min-width: 640px) {
    font-size: 2.5rem;
  }
`;

const TitleHighlight = styled.span`
  display: inline-block;
`;

const Description = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: var(--Text-Color);
  opacity: 0.8;
  margin: 0;
`;

const LocationInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  color: var(--Text-Color);
  opacity: 0.7;

  @media (min-width: 640px) {
    justify-content: flex-start;
  }
`;

const LocationLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: inherit;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
    color: #3b82f6;
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
  width: 1rem;
  height: 1rem;
`;

const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  padding-top: 0.5rem;

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
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  transition: all 0.3s ease;
  border: 1px solid rgba(59, 130, 246, 0.2);

  &:hover {
    background: #3b82f6;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
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
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  transition: all 0.3s ease;
  border: 1px solid rgba(59, 130, 246, 0.2);
  cursor: pointer;

  &:hover {
    background: #3b82f6;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  &:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
`;

const PrintEmailInfo = styled.div`
  display: none;
  font-size: 0.875rem;
  color: var(--Text-Color);
  opacity: 0.7;

  @media print {
    display: block;
  }
`;

const EmailLink = styled.a`
  color: inherit;
  text-decoration: underline;
`;

// 공통 섹션 스타일
const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: var(--Text-Color);
  position: relative;
`;

const SectionDivider = styled.div`
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6 0%, transparent 100%);
  border-radius: 1px;
`;

// About 섹션
const AboutSection = styled.section`
  padding: 2rem 0;
`;

const AboutDescription = styled.p`
  font-size: 1rem;
  line-height: 1.8;
  color: var(--Text-Color);
  opacity: 0.85;
  margin: 0;
`;

// Work Experience 섹션
const WorkExperienceSection = styled.section`
  padding: 2rem 0;
`;

const WorkContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const WorkCard = styled.div`
  position: relative;
  padding: 2rem;
  border-radius: 1rem;
  background: var(--Text-Color);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(59, 130, 246, 0.3);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.1);
    transform: translateY(-2px);
  }

  @media (prefers-color-scheme: light) {
    background: white;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

    &:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }
  }
`;

const WorkCardHeader = styled.div`
  margin-bottom: 1rem;
`;

const WorkHeaderTop = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const WorkCompany = styled.h3`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--Text-Color);
`;

const CompanyLink = styled.a`
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: #3b82f6;
  }
`;

const CompanyBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  background: linear-gradient(135deg, #3b82f6 0%, #9333ea 100%);
  color: white;
  border-radius: 9999px;
`;

const WorkPeriod = styled.div`
  font-size: 0.875rem;
  color: var(--Text-Color);
  opacity: 0.7;
  font-variant-numeric: tabular-nums;
`;

const CompanyDescription = styled.p`
  font-size: 0.875rem;
  color: var(--Text-Color);
  opacity: 0.7;
  margin: 0.5rem 0 0 0;
`;

const JobTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  margin: 1.5rem 0 1rem 0;
  color: var(--Text-Color);
`;

const JobList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const JobItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: var(--Text-Color);
  opacity: 0.8;
  line-height: 1.6;
`;

const JobItemIcon = styled.span`
  color: #3b82f6;
  font-weight: bold;
  flex-shrink: 0;
`;

// Skills 섹션
const SkillsSection = styled.section`
  padding: 2rem 0;
`;

const SkillsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const SkillBadge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%);
  color: var(--Text-Color);
  border: 1px solid rgba(59, 130, 246, 0.2);
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #3b82f6 0%, #9333ea 100%);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
`;

const GitHubIcon = styled.svg.attrs({
  fill: "currentColor",
  width: "1em",
  height: "1em",
})`
  width: 1.25rem;
  height: 1.25rem;
`;

const LinkedInIcon = styled.svg.attrs({
  fill: "currentColor",
  width: "1em",
  height: "1em",
})`
  width: 1.25rem;
  height: 1.25rem;
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
  width: 1.25rem;
  height: 1.25rem;
`;

export default Container;
