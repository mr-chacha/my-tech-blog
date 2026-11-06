# 차차의 개발블로그

Next.js App Router로 만든 개인 기술 블로그와 포트폴리오입니다.

## 실행

Node.js 22 이상이 필요합니다. `.env.local.example`을 참고해 `.env.local`을 준비하세요. 실제 키는 Git에 추가하지 않습니다.

```bash
npm ci
npm run dev
```

개발 서버는 http://localhost:3000 에서 실행됩니다.

```bash
npm test       # 외부 서비스에 쓰기 없이 보안·데이터 회귀 검사
npm run lint
npm run build
npm start      # 프로덕션 빌드 실행
```

## 구성

- `app/`: 서버 페이지, 클라이언트 화면, API Route Handlers
- `components/`: 레이아웃, 글 목록, 공통 마크다운 렌더러, 표 편집기
- `common/apis/`: Firebase ID 토큰을 첨부하는 API 클라이언트
- `common/store/`: 테마, 관리자 인증 준비 상태, 모달 상태
- `common/util/`: 날짜·정렬·공개 여부·HTML 허용 목록·미디어 제한
- `lib/`: 서버 전용 Firestore/S3 연결, 입력 검증
- `tests/`: 비공개 접근, HTML 삽입, 수정 데이터 보존, 업로드 검증

## 주요 기능과 기술

- Next.js 15.5 / React 19 / styled-components / Zustand
- CodeMirror 마크다운 에디터와 정화된 HTML 미리보기; 표·동영상 지원
- Firestore 글·포트폴리오 저장, Firebase GitHub 관리자 로그인
- AWS SDK v3 S3 미디어 업로드: JPG/PNG/GIF/WebP/AVIF, MP4/WebM/MOV, 파일당 3MB
- 카테고리별 DB 커서 페이지네이션과 전역 개수 집계
- 기존 S3 버킷을 재사용하고, 공개 접근 차단 후 미디어를 글 공개 여부/관리자 세션 확인 후 전달
- Giscus 댓글, 다크 모드, 자동 목차, SEO 메타데이터·사이트맵

## 인증과 비공개 글

관리자 권한은 서버에서 검증한 Firebase ID 토큰의 이메일과 `ADMIN_EMAIL`, 이메일 인증 여부로 결정합니다. 클라이언트 상태는 UI 표시를 위한 것입니다.

공개 페이지와 메타데이터에는 비공개 본문을 넣지 않습니다. 관리자는 로그인 확인 후 `private, no-store` 상세 API로 비공개 글을 조회합니다. 목록 API는 본문과 첨부파일을 반환하지 않습니다.

## 배포와 후속 작업

AWS Amplify 빌드 설정은 `amplify.yml`에 있습니다. Node 22와 Next.js 15 호환 배포를 사용합니다. 서버 환경변수 연결은 [환경변수 가이드](docs/AMPLIFY_ENV.md), 변경 단계와 운영 확인 사항은 [개선 내역](docs/SECURITY_AND_RELIABILITY.md)을 참고하세요.

Secrets Manager와 새 S3 버킷을 도입하지 않습니다. 기존 환경변수 전달과 기존 객체를 복사하지 않는 이전 방식을 사용합니다. 기존 서비스의 사용량 과금은 그대로 적용됩니다.
