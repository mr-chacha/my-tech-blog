import styled, { createGlobalStyle } from "styled-components";
import { reset } from "styled-reset";

export const GlobalText = styled.div`
  color: ${(props) => (props.color ? props.color : "var(--Text-Color)")};
  font: ${(props) => (props.font ? props.font : "var(--Body-R)")};
`;

export const pxRem = (px) => {
  return `${Number((px / 16).toFixed(4))}rem`;
};

export const BREAK_POINT = {
  MAX_WIDTH: "1920px",
  MAX_PC: "1919px",
  MIN_PC: "1024px",
  MIN_TABLET: "768px",
  MIN_MOBILE: "368px",
};

export const GlobalStyles = createGlobalStyle`
  ${reset}

  * {
    box-sizing: border-box;

    --Light:#FFFFFF;
    --Dark:#000000;

    --Code-Back-Color:${(props) => (props.isDarkMode ? "#111827" : "#f1f5f9")};
    --Back-Color:${(props) => (props.isDarkMode ? "var(--Dark)" : "var(--Light)")};
    --Text-Color:${(props) => (props.isDarkMode ? "var(--Light)" : "var(--Dark)")};
    --Border-Color :${(props) => (props.isDarkMode ? "rgb(51 65 85)" : "rgb(209 213 219)")};
    --Brand-Colors:#3b82f6;
    --Brand-Colors-Two:#6b7280;

    --Large-Title: 700 ${pxRem(24)}/150% Pretendard;
    --Title: 700 ${pxRem(18)}/150% Pretendard;
    --Title-R: 400 ${pxRem(18)}/150% Pretendard;
    --Headline-R: 400 ${pxRem(16)}/150% Pretendard;
    --Headline-M: 500 ${pxRem(16)}/150% Pretendard;
    --Headline-B: 700 ${pxRem(16)}/150% Pretendard;
    --Body-B: 700 ${pxRem(14)}/150% Pretendard;
    --Body-R: 400 ${pxRem(14)}/150% Pretendard;
    --Body-M: 500 ${pxRem(14)}/150% Pretendard;
    --Caption-B: 700 ${pxRem(12)}/150% Pretendard;
    --Caption-R: 400 ${pxRem(12)}/150% Pretendard;
    --Caption-M: 500 ${pxRem(12)}/150% Pretendard;

    h1{
      font: var(--Large-Title);
      color: var(--Text-Color);
    }
    h2{
      font: var(--Title);
      color: var(--Text-Color);
    }

    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: #444650;
      border-radius: 1px;
    }

    ::-webkit-scrollbar-thumb {
      background: #FFF;
      border-radius: 4px;
      width: 8px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  }

  .giscus {
    margin-top: 1rem !important;
    width: 100% !important;
    max-width: 1200px !important;
    margin: 0 auto !important;
    background-color: #000 !important;
    padding: 20px;
  }

  .color-fg-default,
  .color-text-primary,
  .link-primary,
  a.color-text-primary,
  a[class*="color-text-primary"],
  a[href*="github.com"][class*="color-text-primary"] {
    color: var(--Text-Color) !important;
  }

  html, body {
    height: 100%;
    min-width: 445px !important;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    height: 100%;
    background: ${(props) => (props.isDarkMode ? "var(--Dark)" : "var(--Light)")};
    color: ${(props) => (props.isDarkMode ? "var(--Light)" : "var(--Dark)")};
    font-family: Pretendard;
  }

  body {
    a {
      text-decoration: none;
      color: inherit;
      cursor: pointer;
    }

    h1, h2, h3, h4, h5 {
      margin: 0;
      line-height: unset;
    }

    p {
      margin: 0;
    }

    ul {
      margin: 0;
      padding: 0;
    }

    li {
      padding: 0;
    }

    button {
      border: none;
      background: none;
      cursor: pointer;
      height: 30px;
      font-weight: 700;
      border-radius: 4px;
    }

    input {
      background-color: transparent;
      border: none;
      margin: 0;

      &:focus {
        outline: none;
      }

      &[type="checkbox"] {
        width: 16px;
        height: 16px;
        accent-color: var(--Brand-Colors);
        cursor: pointer;
      }
      &[type='radio']{
        accent-color: var(--Brand-Colors);
      }
    }
  }

  footer {
    color: #FFFFFF;
  }
`;
