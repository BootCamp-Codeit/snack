# 📗 SNACK — Frontend

조직(기업) 단위 **간식 구매·예산·구매 요청·판매자 승인** UI를 제공하는 **Next.js (App Router) + TypeScript** 프론트엔드입니다.  
API·비즈니스 규칙은 [backend/README.md](../backend/README.md) 및 Swagger `{BE}/api/docs` 를 기준으로 합니다.

> monorepo: [BootCamp-Codeit/snack](https://github.com/BootCamp-Codeit/snack)

---

# 🚀 배포 URL

| 구분 | URL | 비고 |
|------|-----|------|
| **GitHub (monorepo)** | https://github.com/BootCamp-Codeit/snack |
| **프론트 (Vercel)** | https://snack-gray.vercel.app |
| **백엔드 (EC2)** | https://ssnackk.duckdns.org |
| **Swagger** | https://ssnackk.duckdns.org/api/docs |
| **팀 FE (레거시)** | https://frontend042.vercel.app |
| **팀 BE (레거시)** | https://anjgkwl.n-e.kr |
| **로컬 FE** | `http://localhost:3000` | `next dev` |
| **로컬 BE** | `http://localhost:3000` | 포트 충돌 시 FE `3001` |

### 배포 상태

| 구분 | 내용 |
|------|------|
| **FE** | Vercel · Root Directory `frontend` |
| **BE** | EC2 + RDS + Docker · [backend/deploy/README.md](../backend/deploy/README.md) |
| **env** | `NEXT_PUBLIC_API_BASE_URL=https://ssnackk.duckdns.org` |

---

# 🎭 데모 계정 (시드)

비밀번호 공통: **`qwert12345!`**

| 용도 | 이메일 | 화면 |
|------|--------|------|
| 구매자 SUPER_ADMIN | `demo@snack.dev` | 예산·멤버(8명)·조직 |
| 구매자 ADMIN | `admin@snack.dev` | 구매 요청 · 장바구니 |
| 구매자 MEMBER | `member@snack.dev` | **장바구니 4품목** · 구매 이력 |
| 구매자 MEMBER | `design@snack.dev` | 승인 대기 구매 요청 |
| 판매자 | `supplier@snack.dev` | **/admin/purchase-manage** PO 승인 |
| 판매자 ADMIN | `catalog@snack.dev` | 상품 등록 내역 |

> 상품 리스트(`/productlist`)는 **구매자 조직** 카탈로그 33건. API 서버(EC2)는 운영 스케줄에 따라 꺼져 있을 수 있음 — 로그인·목록 조회는 EC2 가동 시간에 확인.

시드 재실행: [루트 README](../README.md#데모-체험-시드-데이터) 참고.

---

# 🛠 기술 스택

| 구분 | 사용 |
|------|------|
| 프레임워크 | Next.js 16 (App Router), React 19, TypeScript |
| 스타일·UI | Tailwind CSS 4, shadcn/ui, Radix UI |
| 상태 | Zustand, TanStack Query |
| 문서·테스트 | Storybook, Vitest |
| 배포 | Vercel |

---

# 🧱 화면·라우트

| 경로 | 기능 |
|------|------|
| `/` | 랜딩 |
| `/login`, `/signup`, `/signup/super-admin` | 로그인·최초 조직 생성 가입 |
| `/invite/accept`, `/invitations/signup` | 초대 수락·가입 |
| `/productlist`, `/products/[productId]` | 상품 목록·상세 |
| `/product-register-history` | 상품 등록 내역 |
| `/cart` | 장바구니 |
| `/purchase-requests`, `/purchase-request-detail` | 구매 요청 목록·상세 |
| `/admin/purchase-manage` | 판매자 구매 요청 승인·거절 |
| `/admin/purchase-history` | 구매·지출 내역 |
| `/members`, `/members/budget` | 멤버·예산 |
| `/budget-mng` | 예산 관리 |
| `/profile` | 프로필 |
| `/guide` | 가이드 |

역할(`OrgRole`): JWT·`membership.role` → 헤더 UI (`SUPER_ADMIN` / `ADMIN` / `MEMBER`).

---

# 🔗 백엔드 연동

## 환경 변수

```env
# BE Origin, 끝 슬래시 없음
NEXT_PUBLIC_API_BASE_URL=https://ssnackk.duckdns.org
```

로컬:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

선택:

```env
# 로그인 비밀번호 RSA 전송 (BE 공개키 PEM)
NEXT_PUBLIC_AUTH_LOGIN_RSA_PUBLIC_KEY_PEM=...
```

정의: `src/lib/env.ts` — 미설정 시 기본값 `https://snack-xlvk.onrender.com` (로컬·Vercel에서는 **env 필수**).

## 호출 방식

| 방식 | 설명 |
|------|------|
| **직접 fetch/axios** | `API_BASE_URL` + `/api/...` + `Authorization: Bearer` |
| **Next Route Handler (BFF)** | `src/app/api/*` — 동일 출처로 BE 프록시 (CORS 완화) |

BFF 예: `/api/auth/login` → BE `POST /api/auth/login`  
장바구니·구매·예산·판매자 PO 등도 `app/api/cart`, `app/api/purchase-requests`, `app/api/seller/...` 등으로 프록시.

### BE 도메인 대응

| BE | FE |
|----|-----|
| Auth / Invitations | `login`, `signup`, `invitations/*` |
| Catalog / Products | `productlist`, `products` |
| Cart | `cart`, `app/api/cart` |
| PurchaseRequest | `purchase-requests`, `purchase-request-detail` |
| SellerOrder | `admin/purchase-manage` |
| Budget / Expenses | `budget-mng`, `members/budget`, `admin/purchase-history` |
| Organizations / Members | `members` |

---

# 🔐 인증 (Bearer JWT)

최애의 포토와 달리 **httpOnly 쿠키가 아니라** 클라이언트 저장소입니다.

1. `POST /api/auth/login` (또는 BFF `/api/auth/login`)  
2. 응답 `data.tokens.accessToken` · `refreshToken` → **localStorage**  
   - `snack_access_token`, `snack_refresh_token`  
   - `snack_membership_role` (헤더 UI용)  
3. 이후 API: `Authorization: Bearer <accessToken>`  
4. 만료 임박 시 `ensure-access-token` → `/api/auth/refresh`  

JWT payload: `organizationId`, `role` (`OrgRole`), `sessionId` 등 — 장바구니는 `X-Organization-Id` 헤더도 선택 사용 (`buildCartAuthHeaders`).

로그인 비밀번호: HTTPS 기본. `NEXT_PUBLIC_AUTH_LOGIN_RSA_PUBLIC_KEY_PEM` 설정 시 RSA-OAEP로 `password` 필드 암호화.

---

# 📚 프론트에서 알아둘 규칙

### 성공/에러 (BE)

- 성공: `{ "success": true, "data": ... }`  
- 에러: `{ "success": false, "statusCode", "errorCode", "message", ... }`  

### 구매 플로우 (UI 관점)

1. 상품 담기 → `cart`  
2. 구매 요청 생성 → `purchase-requests` (장바구니 스냅샷)  
3. 판매자 승인 → `admin/purchase-manage` (BE에서 예산 예약)  
4. 구매 완료·지출 → `admin/purchase-history`  

### 초대 링크

`middleware.ts`: `/invite/accept?token=...` → `/invitations/signup` 으로 Edge 리다이렉트 (Suspense 이슈 방지).

### 장바구니 이벤트

`src/lib/cart/events.ts` — 카트 변경 시 헤더 뱃지 등 갱신.

---

# 🛠 로컬 실행

```bash
npm install
# .env.local
# NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
npm run dev
```

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 |
| `npm run build` / `start` | 프로덕션 |
| `npm run lint` | ESLint |
| `npm run storybook` | Storybook (`:6006`) |

BE(`snack-BE/snack`)를 먼저 실행하세요. Swagger: `http://localhost:3000/api/docs`.

---

# 📁 폴더 구조

```
src/
├── app/                 페이지 + Route Handlers (api/*)
├── components/          ui/, header/, cart/, layouts/
├── lib/                 env, api/auth, auth/, cart/, crypto/
├── hooks/
├── providers/           QueryProvider
└── stores/              Zustand
```

상세 트리·팀 페이지 분담은 저장소 루트 `README.md`, `TECH_STACK.md` 참고.

---

# ✅ 배포 체크리스트

- [x] Vercel `NEXT_PUBLIC_API_BASE_URL` = `https://ssnackk.duckdns.org`  
- [x] BE `FRONTEND_URL` = `https://snack-gray.vercel.app`  
- [ ] `demo@snack.dev` / `supplier@snack.dev` 로그인 → 장바구니·구매·승인 화면  
- [ ] signup HTTP 200/201 모두 처리 (`src/lib/api/auth.ts`)  

---

## 8. 트러블슈팅 (대표)

| 증상 | 원인 | 조치 |
|------|------|------|
| API 타임아웃·502 | BE 기동 중 / Nginx upstream | EC2 `docker logs snack-api` · health 확인 |
| signup FE 오류 · BE 200 | FE가 201만 성공 처리 | `auth.ts` — 200/201 모두 success |
| CORS | `FRONTEND_URL` 불일치 | BE `.env` + compose 재기동 |
| 로그인 후 빈 목록 | 시드 미실행 | `docker exec snack-api node prisma/seed.js` |
| BE signup 500 (~10s) | Prisma `$connect()` 풀 | [backend README](../backend/README.md) 2026-05-31 |

---

## 9. 개발·배포 리포트 (날짜별)

### 2026-05-28 ~ 05-30 · Vercel + EC2 monorepo

**상황**  
팀 FE를 monorepo `frontend/`로 이전, BE는 EC2 HTTPS API 연동.

**조치**  
- Vercel Root Directory `frontend`  
- `NEXT_PUBLIC_API_BASE_URL=https://ssnackk.duckdns.org`  
- 루트·FE README Live URL 동기화  

---

### 2026-05-31 · FE signup + BE Prisma 연동

**상황**  
BE signup 수정 후 FE에서 여전히 실패 — HTTP status 처리 및 API URL 확인.

**조치**  
- signup 응답 **200·201** 모두 성공으로 처리  
- BE `prisma.service.ts` `$connect()` → `$queryRaw` (backend README 참고)  
- 데모 시드 — 구매·판매자·장바구니·PO 상태별 샘플  

**결과**  
https://snack-gray.vercel.app 에서 데모 계정으로 end-to-end 체험 가능.

---

# 👥 관련 저장소

| Repo | 역할 |
|------|------|
| [BootCamp-Codeit/snack](https://github.com/BootCamp-Codeit/snack) | **포트폴리오 monorepo** (본 repo) |
| [Codeit-Snack/frontend](https://github.com/Codeit-Snack/frontend) | 팀 원본 FE |
| [Codeit-Snack/backend](https://github.com/Codeit-Snack/backend) | 팀 원본 BE |
