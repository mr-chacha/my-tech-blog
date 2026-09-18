# Amplify 환경변수 가이드 (Firebase Admin 안전 설정)

`next.config.js`의 `env`에 서버 비밀키를 넣지 않습니다.  
Amplify **Hosting → Environment variables**에만 등록하고, 서버 코드의 `process.env`로만 읽습니다.

---

## 왜 배포만 깨졌는가

| 환경 | 동작 |
|------|------|
| 로컬 | `.env` → Next가 자동 로드 → OK |
| Amplify (예전) | `next.config env`가 빌드 시 키를 서버 번들에 인라인 → OK (노출 위험) |
| Amplify (지금) | 런타임 `process.env`만 사용 → **키가 SSR/API에 안 들어오거나 줄바꿈이 깨지면 500** |

`GET /api/firebase/posts` 가 500이면 Firebase Admin 초기화 실패입니다.

---

## 필수 서버 환경변수

Amplify 콘솔에 아래를 **모두** 등록한 뒤 **재배포**하세요.

```text
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...@....iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY_BASE64=...   # 권장
ADMIN_EMAIL=...
```

공개용(`NEXT_PUBLIC_*`)은 기존처럼 유지하면 됩니다.  
GA는 `NEXT_PUBLIC_GA_MEASUREMENT_ID`를 추가하세요.

> `next.config.js`의 `env { FIREBASE_PRIVATE_KEY: ... }` 로 되돌리지 마세요.  
> 클라이언트 번들에 인라인될 수 있습니다.

---

## Private Key — Amplify에서 가장 안전한 방법 (권장)

줄바꿈(`\n`)이 Amplify에서 깨지는 경우가 많습니다.  
**BASE64로 한 줄** 만들어 넣는 방식을 권장합니다.

### 1) 로컬에서 Base64 만들기 (macOS)

PEM 파일(`-----BEGIN PRIVATE KEY-----` …)이 있다면:

```bash
base64 -i path/to/private_key.pem | tr -d '\n'
echo
```

또는 이미 `.env`에 있는 키 문자열(실제 개행 포함)을 파일로 저장한 뒤 위 명령 실행.

### 2) Amplify에 등록

- 이름: `FIREBASE_PRIVATE_KEY_BASE64`
- 값: 위에서 나온 **한 줄** 문자열 (따옴표 없이)

기존 `FIREBASE_PRIVATE_KEY`는 있어도 되지만, Base64가 있으면 코드가 그걸 우선 사용합니다.

### 3) 재배포

환경변수 변경 후 Amplify에서 **Redeploy this version** 또는 새 커밋 배포.

---

## 기존 `FIREBASE_PRIVATE_KEY`를 그대로 쓸 때

한 줄 + `\n` 이스케이프 형태여야 합니다.

```text
-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n
```

주의:

- 값에 실제 Enter 개행이 섞이면 Amplify에서 잘릴 수 있음
- 값 양끝의 `"` 가 포함되면 파싱 실패할 수 있음 (코드에서 일부 제거하지만 Base64가 더 안전)

---

## 배포 후 확인

1. `https://your-domain/api/firebase/posts` → **200** + JSON 배열  
2. 실패 시 응답에 `code: FIREBASE_ADMIN_ERROR` 와 hint가 옴 (키 값 자체는 없음)  
3. Amplify **Hosting → Monitoring / Logs** 에서  
   `[firebase-admin] Missing env` 또는 `Failed to initialize` 메시지 확인

---

## 하지 말 것

- `next.config.js` → `env`에 `FIREBASE_PRIVATE_KEY` 넣기  
- `NEXT_PUBLIC_` 접두사로 서버 키 노출  
- GitHub / PR / 이슈에 private key 붙여넣기  
- 로그에 private key 출력하기
