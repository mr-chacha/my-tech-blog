🚀 Copilot Review Instructions
📌 리뷰 기본 원칙

모든 리뷰는 한국어로 작성합니다.

로직, 구조, 성능, 안정성, 유지보수성을 우선적으로 검토합니다.

React 개발에 최적화된 코멘트만 남기고, UI 텍스트, alt, 띄어쓰기, 문장 nitpick 코멘트는 금지합니다.

🔥 React 중심 리뷰 규칙 (중요)
1) 불필요한 리렌더링

다음 항목이 있는지 집중적으로 확인하고 제안하세요:

props drilling으로 인해 불필요한 재렌더 발생

부모 state 변경으로 전체 컴포넌트가 리렌더되는 문제

memoization 없이 매 렌더마다 새로운 객체/함수 생성되는 문제

반드시 다음 방법 중 하나를 제안하도록 합니다:

React.memo

useCallback

useMemo

useRef 활용

state 최소화 / state 위치 조정(상향/하향 이동)

2) 상태관리(state) 최적화

아래 상황이 있는지 확인하고 필요하면 개선안을 제시합니다:

복잡한 상태를 여러 useState로 나누어 관리 → useReducer로 합칠 수 있는지 검토

비용이 큰 데이터 파싱/연산을 렌더 중에 실행하는지

불필요한 상태(state duplication) 존재 여부

props/state 변경돼도 UI 변화 없는 값이 state로 관리되는지 여부

3) useCallback / useMemo 규칙

아래 조건이 있을 때만 사용을 제안합니다:

useCallback 추천 케이스

자식 컴포넌트에 함수를 props로 넘길 때

의존성이 자주 바뀌지 않을 때

함수 생성 비용이 크거나, 자식이 memoized 되어 있을 때

useMemo 추천 케이스

무거운 계산 로직이 있는 경우

.filter(), .map(), .reduce() 같은 연산이 렌더마다 반복될 때

props/state에서 파생된 값이 UI에 직접적으로 사용되는 경우

4) 비즈니스 로직 리뷰 강화

로직 흐름이 이해하기 어려운 경우 구조 개선 제안

예외처리 부족할 경우 개선

조건문 분기 최적화 / early-return 방식 제안

중복 코드 제거

API 호출, 비동기 처리 (예: error handling, race condition 가능성) 검토

🚫 불필요한 리뷰 금지 (중요)

아래 항목은 코멘트를 금지합니다:

alt 텍스트 내용 개선

"이 문장은 좀 더 자연스럽게 쓸 수 있을 것 같습니다"

작은 변수명 스타일, 띄어쓰기

코드 스타일 관련 nitpick (prettier가 해결할 수 있는 부분)

HTML 속성 순서

UI/문구 개선

오타 지적

“더 구체적인 alt 텍스트를 사용하세요” 같은 중요도 낮은 피드백

🧪 테스트 / 안정성

다음에 대해 반드시 코멘트합니다:

예외처리 미흡

null/undefined 안전하지 않은 접근

로딩/에러 상태 미구현

API 응답 실패 시 대처 부족

비동기 로직의 race condition 가능성

📘 마무리

리뷰 결론에서는 다음을 제공해야 합니다:

핵심 문제 요약

개선된 전체 구조 제안

중요도 높은 항목부터 정렬된 actionable 피드백 제공