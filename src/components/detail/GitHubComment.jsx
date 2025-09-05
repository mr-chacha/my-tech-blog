import styled from "styled-components";
import React, {useEffect, useRef} from "react";

export const GitHubComment = ({postId, postTitle}) => {
  const commentRef = useRef(null);
  const observerRef = useRef(null);

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
    script.setAttribute("data-mapping", "pathname");
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

  // MutationObserver로 Giscus DOM 변경 감지
  useEffect(() => {
    const moveGiscusToContainer = () => {
      const container = commentRef.current;
      if (!container) return;

      // 모든 giscus 요소 찾기
      const giscusElements = document.querySelectorAll('.giscus, [data-repo], iframe[src*="giscus"]');

      giscusElements.forEach((element) => {
        // 이미 올바른 위치에 있는지 확인
        if (container.contains(element)) {
          return;
        }

        // footer 밖에 있는지 확인
        const footer = document.querySelector("footer");
        if (footer && footer.contains(element)) {
          return; // footer 안에 있으면 건드리지 않음
        }

        // body의 마지막 자식인지 확인 (footer 밖에 있는 경우)
        if (element.parentNode === document.body) {
          container.appendChild(element);
        }
      });
    };

    // MutationObserver 설정
    observerRef.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // giscus 관련 요소가 추가되었는지 확인
              if (
                node.classList?.contains("giscus") ||
                node.getAttribute?.("data-repo") ||
                (node.tagName === "IFRAME" && node.src?.includes("giscus"))
              ) {
                setTimeout(moveGiscusToContainer, 100);
              }

              // 자식 요소들도 확인
              const giscusChild = node.querySelector?.('.giscus, [data-repo], iframe[src*="giscus"]');
              if (giscusChild) {
                setTimeout(moveGiscusToContainer, 100);
              }
            }
          });
        }
      });
    });

    // body 전체 감시
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // 초기 실행
    setTimeout(moveGiscusToContainer, 500);

    // 컴포넌트 언마운트 시 observer 정리
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [postId, postTitle]);

  // 포스트가 변경될 때마다 Giscus 새로고침
  useEffect(() => {
    if (window.giscus && commentRef.current) {
      // Giscus 위젯 새로고침
      window.giscus?.refresh();

      // 새로고침 후 다시 확인
      setTimeout(() => {
        const container = commentRef.current;
        const giscusElements = document.querySelectorAll('.giscus, [data-repo], iframe[src*="giscus"]');

        giscusElements.forEach((element) => {
          if (container && !container.contains(element)) {
            container.appendChild(element);
          }
        });
      }, 1000);
    }
  }, [postId, postTitle]);

  return (
    <CommentContainer ref={commentRef}>
      <CommentTitle>댓글</CommentTitle>
      {/* Giscus 위젯이 여기로 이동됨 */}
    </CommentContainer>
  );
};

const CommentContainer = styled.div`
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
  border-top-color: #374151;
  max-width: 1200px;
`;

const CommentTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--Text-Color);
`;
