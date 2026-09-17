# Pull Request 가이드

이 문서는 `my-tech-blog`에서 PR을 만들 때 따르는 기준입니다.  
사용자가 **「PR 올려」**, **「PR 만들어」**, **「develop에 PR」** 등으로 요청하면, AI/작업자는 **반드시 이 가이드를 읽고** 아래 절차대로 진행합니다.

---

## 1. 기본 규칙

| 항목 | 내용 |
|------|------|
| 기본 base 브랜치 | `develop` (사용자가 다른 base를 지정하면 그 브랜치 사용) |
| 작업 브랜치 | 현재 작업 브랜치에서 PR 생성 (없으면 `fix/…` 또는 `feat/…` 형태로 생성) |
| 커밋 | PR 전에 **관련 변경을 커밋**한다. 사용자가 커밋을 금지한 경우만 예외 |
| 비밀 파일 | `.env`, 키·토큰 파일은 **절대 커밋/PR에 포함하지 않음** |
| 원격 | `origin`에 push 후 `gh pr create`로 PR 생성 |
| 완료 시 | PR URL을 사용자에게 전달 |

---

## 2. PR 올리기 전 체크리스트

1. `git status`로 변경·미추적 파일 확인
2. `git diff` / `git diff --staged`로 내용 검토
3. `git log develop..HEAD` (또는 지정 base)로 커밋 범위 확인
4. base와 충돌 여부 대략 확인 (`git fetch origin develop`)
5. `.env` 등 시크릿이 스테이징되지 않았는지 확인
6. 필요 시 로컬에서 `npm run build` 또는 관련 검증

---

## 3. 커밋 메시지 스타일

이 저장소 최근 스타일을 따릅니다.

- 형식: `타입 : 요약` (콜론 앞뒤 공백 허용)
- 타입 예: `feat`, `fix`, `refactor`, `docs`, `chore`
- 한 줄 요약, 한국어 OK
- 예:
  - `feat : 포트폴리오 탭 추가`
  - `fix : seo 에러 수정`
  - `docs : PR 가이드 추가`

여러 성격의 변경이 한 PR에 있으면 **의미 단위로 커밋을 나누거나**, 불가피하면 하나의 커밋 메시지에 핵심을 모두 담습니다.

---

## 4. PR 제목

- 한국어로 변경 목적을 한 줄로 작성
- 가능하면 타입 prefix 사용: `feat: …`, `fix: …`, `docs: …`
- 예: `fix: SEO·시크릿 노출 개선 및 GA4 추가`

---

## 5. PR 본문 템플릿 (필수)

`gh pr create` 시 아래 구조를 **반드시** 채웁니다.  
“무엇을 했는지”가 보이도록 **작업 내용**을 구체적으로 씁니다.

```markdown
## Summary
- (변경의 목적/배경 1~3줄)

## 작업 내용
- [ ] 항목별로 실제로 한 일을 체크리스트로 작성
- [ ] 파일/영역 단위로 읽기 쉽게

## 주요 변경 파일
- `path/to/file` — 짧은 설명

## Test plan
- [ ] 로컬/배포에서 확인할 항목
- [ ] 회귀·보안·SEO 등 관련 검증

## Notes (선택)
- 배포 시 필요한 환경변수, 후속 작업, 주의사항
```

### 작성 팁

- **Summary**: “왜” 이 변경이 필요한지
- **작업 내용**: “무엇을” 했는지 (기능/버그/문서/설정)
- **Test plan**: 리뷰어·본인이 따라 할 수 있는 확인 절차
- 시크릿 값·토큰은 본문에 붙이지 말 것 (환경변수 **이름**만 적어도 됨)

---

## 6. 실행 명령 순서

```bash
# 1) 최신 develop 확인
git fetch origin develop

# 2) 변경 스테이징 & 커밋 (시크릿 제외)
git add <관련 파일들>
git commit -m "$(cat <<'EOF'
타입 : 요약

EOF
)"

# 3) 원격 푸시
git push -u origin HEAD

# 4) PR 생성 (base: develop)
gh pr create --base develop --title "타입: 제목" --body "$(cat <<'EOF'
## Summary
- …

## 작업 내용
- [ ] …

## 주요 변경 파일
- …

## Test plan
- [ ] …

## Notes (선택)
- …

EOF
)"
```

---

## 7. AI에게 요청할 때

다음처럼 말하면 이 가이드대로 처리합니다.

- `develop에 PR 올려`
- `PR 올려줘` (base 미지정 시 → `develop`)
- `main에 PR` (명시 시 해당 base 사용)

추가 지시 예:

- `커밋 메시지는 feat 로`
- `이 파일은 PR에서 빼줘`
- `DRAFT로 올려`

---

## 8. 하지 말 것

- `main`/`master`에 force push
- `--no-verify`로 훅 건너뛰기 (사용자 명시 요청 없으면)
- `.env` 및 실제 키 값 커밋
- 작업 내용 없는 빈 PR 본문 (`Summary`만 한 줄로 대충 쓰기 금지)
