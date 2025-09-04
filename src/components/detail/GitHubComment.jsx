import React, {useEffect, useRef} from "react";
import styled from "styled-components";

export const GitHubComment = ({postId, postTitle}) => {
  const commentRef = useRef(null);

  useEffect(() => {
    // Giscus 스크립트가 이미 로드되어 있는지 확인
    if (window.giscus) {
      return;
    }

    // Giscus 스크립트 로드
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", process.env.REACT_APP_GITHUB_REPO);
    script.setAttribute("data-repo-id", process.env.REACT_APP_GITHUB_REPO_ID);
    script.setAttribute("data-category", process.env.REACT_APP_GITHUB_CATEGORY);
    script.setAttribute("data-category-id", process.env.REACT_APP_GITHUB_CATEGORY_ID);
    script.setAttribute("data-mapping", "pathname"); // specific에서 pathname으로 변경
    script.setAttribute("data-term", process.env.REACT_APP_GITHUB_TERM);
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", "preferred_color_scheme");
    script.setAttribute("data-lang", "ko");
    script.crossOrigin = "anonymous";
    script.async = true;

    // 스크립트를 body에 추가
    document.body.appendChild(script);

    // 컴포넌트 언마운트 시 스크립트 제거
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // 포스트가 변경될 때마다 Giscus 새로고침
  useEffect(() => {
    if (window.giscus && commentRef.current) {
      // Giscus 위젯 새로고침
      window.giscus?.refresh();
    }
  }, [postId, postTitle]);

  return (
    <CommentContainer>
      <CommentTitle>댓글</CommentTitle>
      <CommentSection ref={commentRef}>{/* Giscus 위젯이 여기에 렌더링됩니다 */}</CommentSection>
    </CommentContainer>
  );
};

const CommentContainer = styled.div`
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
  border-top-color: #374151;
`;

const CommentTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--Text-Color);
`;

const CommentSection = styled.div`
  // Giscus 위젯 스타일링
  .giscus {
    margin-top: 1rem;
  }
`;
