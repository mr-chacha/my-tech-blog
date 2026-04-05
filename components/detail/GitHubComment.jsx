"use client";
import styled from "styled-components";
import React, { useEffect, useRef } from "react";

export const GitHubComment = ({ postId, postTitle }) => {
  const commentRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (window.giscus) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", process.env.NEXT_PUBLIC_GITHUB_REPO);
    script.setAttribute("data-repo-id", process.env.NEXT_PUBLIC_GITHUB_REPO_ID);
    script.setAttribute("data-category", process.env.NEXT_PUBLIC_GITHUB_CATEGORY);
    script.setAttribute("data-category-id", process.env.NEXT_PUBLIC_GITHUB_CATEGORY_ID);
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-term", process.env.NEXT_PUBLIC_GITHUB_TERM);
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", "preferred_color_scheme");
    script.setAttribute("data-lang", "ko");
    script.crossOrigin = "anonymous";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    const moveGiscusToContainer = () => {
      const container = commentRef.current;
      if (!container) return;

      const giscusElements = document.querySelectorAll('.giscus, [data-repo], iframe[src*="giscus"]');

      giscusElements.forEach((element) => {
        if (container.contains(element)) {
          return;
        }

        const footer = document.querySelector("footer");
        if (footer && footer.contains(element)) {
          return;
        }

        if (element.parentNode === document.body) {
          container.appendChild(element);
        }
      });
    };

    observerRef.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (
                node.classList?.contains("giscus") ||
                node.getAttribute?.("data-repo") ||
                (node.tagName === "IFRAME" && node.src?.includes("giscus"))
              ) {
                setTimeout(moveGiscusToContainer, 100);
              }

              const giscusChild = node.querySelector?.('.giscus, [data-repo], iframe[src*="giscus"]');
              if (giscusChild) {
                setTimeout(moveGiscusToContainer, 100);
              }
            }
          });
        }
      });
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(moveGiscusToContainer, 500);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [postId, postTitle]);

  useEffect(() => {
    if (window.giscus && commentRef.current) {
      window.giscus?.refresh();

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
