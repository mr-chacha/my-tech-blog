# Amplify 환경변수 가이드 (Firebase Admin)

## 현재 이 프로젝트의 동작 방식

Amplify Hosting(Next.js SSR/API)에서는 콘솔에 env를 넣어도 **요청 시점 런타임에 시크릿이 비는 경우**가 있습니다.  
그래서 `next.config.js`의 `env`로 **빌드 시 서버 번들에 주입**합니다. (로컬 `.env` / Amplify 콘솔 값 → 빌드 → API·SSR에서 사용)

기존에 쓰던 **한 줄 `FIREBASE_PRIVATE_KEY` 그대로** 쓰면 됩니다. Base64로 바꿀 필요 없습니다.

```text
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
ADMIN_EMAIL=...
```

## 주의 (보안)

- `NEXT_PUBLIC_` 으로 서버 키를 올리지 말 것
- 클라이언트 코드에서 `process.env.FIREBASE_PRIVATE_KEY` 등을 **참조하지 말 것**
- 배포 후 확인: 클라이언트 번들에 키 문자열이 없어야 함

```bash
# 로컬 빌드 후 (키가 나오면 안 됨)
rg -l "BEGIN PRIVATE KEY" .next/static || echo "OK: not in client static"
```

## API 장애 시

`GET /api/firebase/posts` 가 500이면 응답의 `envStatus`로 **어떤 변수 이름만 비었는지** 확인합니다. (값은 안 나옴)

```json
{
  "code": "FIREBASE_ADMIN_ERROR",
  "envStatus": {
    "FIREBASE_PROJECT_ID": true,
    "FIREBASE_CLIENT_EMAIL": true,
    "FIREBASE_PRIVATE_KEY": false
  }
}
```

전부 `true`인데도 실패하면 Amplify 로그의 `[firebase-admin]` 메시지를 확인하세요.

## 재배포

Amplify 콘솔 env 변경 후에는 **반드시 재빌드/재배포**해야 `next.config` 주입이 반영됩니다.
