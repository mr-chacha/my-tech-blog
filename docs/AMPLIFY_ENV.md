# 기존 Amplify 환경변수와 S3 사용

대상 앱: `d1ug7261swrxqn`, 서울 리전 `ap-northeast-2`, 운영 브랜치 `develop`.

Secrets Manager, 새 버킷, 새 IAM 역할을 필수로 도입하지 않습니다. 기존 Amplify 환경변수와 기존 S3 버킷을 사용합니다. 새 인프라 생성 템플릿과 Secrets Manager SDK는 제거했습니다. 코드 수정 중 운영 리소스는 생성하거나 변경하지 않았습니다.

## 서버 환경변수

필수:

- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY_BASE64` 또는 `FIREBASE_PRIVATE_KEY`
- `ADMIN_EMAIL`: 이메일 인증된 관리자 GitHub 계정
- `S3_BUCKET_NAME`: 기존 버킷 이름 (`AWS_BUCKET_NAME`도 지원)

S3 접근:

- 기존 `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`를 서버 전용으로 사용합니다. 둘 다 설정하거나 둘 다 생략합니다.
- 이미 SSR 컴퓨팅 역할이 있는 환경에서는 키를 생략하고 AWS 기본 자격 증명 체인을 사용할 수 있습니다. 역할 자체는 선택 사항이며 새로 생성하지 않습니다.
- `S3_REGION`의 기본값은 `ap-northeast-2`입니다.

클라이언트 공개 설정은 `.env.local.example`의 `NEXT_PUBLIC_*`를 참고하세요. Firebase 개인키/S3 비밀키에 `NEXT_PUBLIC_`를 붙이거나 `next.config.js`의 `env`에 넣지 않습니다.

## Amplify SSR에 전달

`amplify.yml`에서 `scripts/write-server-env.mjs`를 실행합니다. 허용된 서버 변수와 공개 변수만 `.env.production`에 기록합니다. PEM은 Base64 한 줄로 정규화하고 파일 권한을 0600으로 제한하며 값은 로그에 출력하지 않습니다. `.env.production`은 Git에서 제외합니다.

이 방법은 별도 비밀 저장 서비스를 사용하지 않는 대신 **배포 산출물에 서버 비밀값이 포함됩니다**. 산출물·빌드 작업·로그를 읽는 권한을 제한하고, 공개 `.next/static`에 실제 비밀값이 포함되지 않는지 확인하세요. 키를 채팅·PR 본문에 붙이지 않습니다. 키가 노출된 경우 교체는 별도 운영 작업입니다.

공식 환경변수 전달 방식: https://docs.aws.amazon.com/amplify/latest/userguide/ssr-environment-variables.html

## 기존 버킷으로 비공개 첨부 보호

새 파일은 기존 버킷에 저장하되 `/api/media/<id>` 주소만 글에 넣습니다. API가 현재 글의 공개 여부와 관리자 세션을 확인한 후 내용을 전달합니다. 업로드는 버킷의 공개 접근 차단 설정 4개가 모두 켜져 있어야 허용합니다.

기존 공개 URL을 사용 중이라면 **버킷을 먼저 비공개로 바꾸면 기존 이미지가 깨집니다**. 다음 순서로 이전해야 합니다. 아래 작업은 준비만 했으며 실행하지 않았습니다.

1. 다른 사이트와 버킷을 공유하는지 확인합니다. 공유 버킷이면 전체 비공개 전환을 진행하지 말고 영향 범위를 별도 검토합니다.
2. 유지보수 시간에 기존 글·포트폴리오 쓰기를 중지합니다. 이전 운영 코드는 유지보수 마커를 검사하지 않습니다.
3. 아래 dry-run 결과와 백업을 확인한 뒤, 기존 S3 객체를 그대로 두고 미디어 레지스트리와 글의 주소만 변경합니다. 파일을 복사·재업로드·삭제하지 않습니다. 같은 객체를 가리키는 레지스트리에는 원본 보존 표시를 남겨 정리 API에서도 원본을 삭제하지 않습니다.
4. 인덱스·규칙과 스키마 마이그레이션을 준비하고 새 코드의 스테이징에서 공개/비공개 이미지, 동영상 Range 요청, 로그인/로그아웃을 확인합니다.
5. 기존 S3 직접 주소의 DB 참조가 0인지 검사한 뒤 기존 전용 버킷의 공개 접근을 차단합니다. 그 전까지 예전 공개 주소는 여전히 열려 있을 수 있습니다. 차단 이후에도 이미 다운로드된 파일은 회수할 수 없습니다.
6. 운영 전환 시 캐시를 무효화하고 읽기 전용 검증 도구로 확인합니다.

`infra/existing-bucket-policy.example.json`은 기존 IAM 사용자/역할에 필요한 S3 권한 예시입니다. 버킷 이름을 실제 값으로 바꾸고 기존 권한을 검토할 때 참고합니다. 새 리소스를 생성하거나 자동으로 권한을 변경하지 않습니다. 마이그레이션 운영자 권한은 별도로 관리하세요.

## 목록/첨부 마이그레이션

효율적인 커서 쿼리는 정렬 필드와 집계가 필요합니다. 인덱스가 준비되지 않은 DB도 호환 조회로 기존 글을 표시합니다. 이 경로는 본문을 제외한 전체 요약 문서를 읽고 공개 여부·카테고리·페이지를 계산하므로, 문서 수가 많아지면 아래 마이그레이션으로 Firestore 읽기량을 줄입니다. Firestore 규칙은 클라이언트 직접 DB 접근을 차단하고 서버 API만 사용하도록 합니다. 같은 DB를 다른 앱이 쓰는지 먼저 확인합니다.

```bash
# 인덱스 생성 완료 후 실행. 기본은 조회만 하는 dry-run
node scripts/migrate-post-index.mjs --project PROJECT_ID
node scripts/migrate-private-media.mjs --project PROJECT_ID

# 결과 검토 후 적용. 백업에는 비공개 본문이 포함될 수 있으므로 접근 제한
node scripts/migrate-post-index.mjs --project PROJECT_ID --apply --backup-dir .backups/index
node scripts/migrate-private-media.mjs --project PROJECT_ID --apply --backup-dir .backups/media

# 기존 직접 주소가 남아 있으면 버킷 비공개 전환 거부
node scripts/lock-legacy-bucket.mjs --project PROJECT_ID --source-bucket EXISTING_BUCKET
node scripts/lock-legacy-bucket.mjs --project PROJECT_ID --source-bucket EXISTING_BUCKET --apply --backup-dir .backups/bucket --confirm-dedicated-bucket EXISTING_BUCKET

node scripts/verify-cloud.mjs --project PROJECT_ID
```

첨부 등록은 기존 버킷 내부 객체만 읽습니다. 다른 버킷으로 복사하는 기능은 비활성화했습니다. 외부 이미지, 3MB 초과 또는 지원하지 않는 형식은 수동 검토 대상으로 보고합니다. 실패 시 미연결 레지스트리만 정리하고 S3 원본은 건드리지 않습니다. 중단된 마이그레이션은 원인 해결 후 다시 실행하며 한 번에 하나만 실행합니다.

목록 마이그레이션은 정렬·공개·카테고리 필드와 집계만 만듭니다. 손상된 과거 작성일·통계는 임의로 복구하지 않습니다. 롤백은 백업의 Firestore 타임스탬프 타입과 버킷 정책을 함께 검토해 수행해야 합니다.

## 비용 범위

추가 유료 서비스나 중복 S3 파일 저장 공간을 요구하지 않습니다. 기존 Amplify/S3/Firestore의 요청·전송·읽기·쓰기 사용량은 여전히 해당 서비스의 과금 기준을 따릅니다. 미디어 API와 마이그레이션도 이 기존 사용량에 포함되므로 총 사용료가 항상 0원이라고 보장하지 않습니다. 운영 적용 전에 현재 무료 사용량과 예산 알림을 확인하세요.
