import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeSlug from "rehype-slug";
import styled from "styled-components";

export const MarkDownContent = ({content, tempFiles = [], isPreview = false}) => {
  if (!content) {
    return null;
  }

  const convertTempImagesToPreview = (markdownContent) => {
    let convertedContent = markdownContent;

    console.log("=== 이미지 변환 디버깅 ===");
    console.log("원본 내용:", markdownContent);
    console.log("tempFiles:", tempFiles);

    if (tempFiles && tempFiles.length > 0) {
      tempFiles.forEach((tempFile) => {
        console.log("처리할 파일:", tempFile.tempName, "->", tempFile.base64Url);
        const tempImageRegex = new RegExp(`!\\[([^\\]]*)\\]\\(${tempFile.tempName}\\)`, "g");
        convertedContent = convertedContent.replace(tempImageRegex, `![$1](${tempFile.base64Url})`);
      });
    }

    console.log("변환 후 내용:", convertedContent);
    return convertedContent;
  };

  const preprocessMarkdown = (content) => {
    // content 확인
    if (!content || typeof content !== "string") {
      return "";
    }

    const sections = content.split(/\n\s*\n/);
    return sections
      .map((section) => {
        const lines = section.split("\n");

        // 첫 번째 줄이 >로 시작하면 전체 섹션을 블록쿼트로 처리
        if (lines[0] && lines[0].startsWith(">")) {
          return lines
            .map((line) => {
              if (line.startsWith(">")) {
                return line;
              } else if (line.trim() !== "") {
                return "> " + line;
              } else {
                return line;
              }
            })
            .join("\n");
        }

        return section;
      })
      .join("\n\n");
  };

  return (
    <ContentWrapper>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeSlug]}>
        {preprocessMarkdown(convertTempImagesToPreview(content))}
      </ReactMarkdown>
    </ContentWrapper>
  );
};

const ContentWrapper = styled.div`
  font-weight: 400;
  line-height: 1rem;
  background-color: var(--Content-Back-Color);
  color: var(--Text-Color) !important;

  p + h1,
  p + h2,
  p + h3,
  p + h4 {
    margin-top: 3rem;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.4rem;
    margin: 1rem 0 0.5rem 0;
    font-weight: bold;
    color: var(--Text-Color);
  }

  h1 {
    font-size: 3rem;
    line-height: 3rem;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
  h2 {
    font-size: 2rem;
    line-height: 1.5rem;
    margin-top: 0.93em;
    margin-bottom: 0.93em;
  }
  h3 {
    font-size: 1.5rem;
    line-height: 1.5rem;
    margin-top: 0.83em;
    margin-bottom: 0.83em;
  }
  h4 {
    font-size: 1.125rem;
    line-height: 1.5rem;
    margin-top: 0.73em;
    margin-bottom: 0.73em;
  }

  p {
    font-size: 1rem;
    margin-bottom: 0.75rem;
    color: var(--Text-Color);
    white-space: pre-line;
    line-height: 1rem;
  }

  li {
    font-size: 1rem;
    margin-bottom: 0.25rem;
  }

  ul {
    margin-left: 1.5rem;
    margin-bottom: 0.75rem;
    list-style-type: disc;
  }

  strong {
    font-weight: bold;
    color: var(--Text-Color);
  }

  em {
    font-style: italic;
    color: var(--Text-Color);
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 1.5rem auto;
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  code {
    background: #f1f5f9;
    padding: 3px 6px;
    border-radius: 4px;
    font-size: 0.875rem;
    font-family: Monaco, Consolas, monospace;
    color: var(--Back-Color);
  }

  pre {
    background: #f8fafc;
    padding: 16px;
    border-radius: 8px;
    overflow: auto;
    margin: 1.5rem 0;
    border: 1px solid #e2e8f0;

    code {
      background: none;
      padding: 0;
      font-family: Monaco, Consolas, monospace;
      font-size: 0.875rem;
    }
  }

  a {
    color: #3b82f6;
    text-decoration: underline;

    &:hover {
      color: #2563eb;
    }
  }

  blockquote {
    border-left: 4px solid #3b82f6;
    padding-left: 1rem;
    margin: 0.75rem 0;
    color: #6b7280;
    background-color: #f8fafc;
    padding: 1rem;
    border-radius: 0.25rem;
  }

  del {
    text-decoration: line-through;
  }
`;
