import styled, {createGlobalStyle} from "styled-components";
import {reset} from "styled-reset";

export const GlobalText = styled.div`
  color: ${(props) => (props.color ? props.color : "var(--Text-Color)")};
  font: ${(props) => (props.font ? props.font : "var(--Body-R)")};
`;

export const pxRem = (px) => {
  return `${Number((px / 16).toFixed(4))}rem`;
};
// 1. PC 최대 width 값 1920px
// 2. 1920 아래는 min width 1024로 고정 하여 가운제 정렬
// 3. 1024 아래는 min width 1024로 고정된 상태로 좌우 스크롤이 생겨서 더이상 화면이 줄지않게 고정
// 4. 768 부터는 min width 1024를 해제하고 width 100% 고정 한상태러 화면이 줄어들고
// 5. 368이 모바일에서도 최소 보여지는 값으로 고정

export const BREAK_POINT = {
  MAX_WIDTH: "1920px",
  // PC 최대 width
  MAX_PC: "1919px",
  // PC 최소 width (고정)
  MIN_PC: "1024px",
  // 태블릿 최소 width
  MIN_TABLET: "768px",
  // 모바일 최소 width (고정)
  MIN_MOBILE: "368px",
};

export const GlobalStyles = createGlobalStyle`
  ${reset}
  
  
  * {
    box-sizing: border-box;
  
    // Text Colors
    --Light:#FFFFFF;
    --Dark:#000000;

    // Back Colors
    --Back-Color:${(props) => (props.isDarkMode ? "var(--Dark)" : "var(--Light)")};
    --Text-Color:${(props) => (props.isDarkMode ? "var(--Light)" : "var(--Dark)")};
    --Border-Color :${(props) => (props.isDarkMode ? "rgb(51 65 85)" : "rgb(209 213 219)")};
    --Brand-Colors:#3b82f6;
    --Brand-Colors-Two:#f1f5f9;


    // Typography
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
    height: 8px; /* 가로 스크롤바 높이 */
    }

    ::-webkit-scrollbar-track {
    background: #444650; /* 스크롤 트랙 배경 */
    border-radius: 1px;
    }

    ::-webkit-scrollbar-thumb {
    background: #FFF; /* 스크롤 색상 */
    border-radius: 4px;
    width: 8px;
    }

    ::-webkit-scrollbar-thumb:hover {
    background: #555; /* 마우스 오버 시 색상 */
   }
  }

  html, body {
    height: 100%;
  }

  html,
  body,
  body > #app { /* the react root */
    margin: 0;
    padding: 0;
    height: 100%;
    background: ${(props) => (props.isDarkMode ? "var(--Dark)" : "var(--Light)")};
    color: ${(props) => (props.isDarkMode ? "var(--Light)" : "var(--Dark)")};
    font-family: Pretendard;
    
  }

  body {
    #root {
      height: 100%;
    }
 
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
