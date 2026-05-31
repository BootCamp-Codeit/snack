# 📗 SNACK — Frontend

조직(기업) 단위 **간식 구매·예산·구매 요청·판매자 승인** UI를 제공하는 **Next.js (App Router) + TypeScript** 프론트엔드입니다.  
API·비즈니스 규칙은 [backend/README.md](../backend/README.md) 및 Swagger `{BE}/api/docs` 를 기준으로 합니다.

> monorepo: [BootCamp-Codeit/snack](https://github.com/BootCamp-Codeit/snack)

---

# 🚀 배포 URL

| 구분 | URL | 비고 |
|------|-----|------|
| **GitHub (monorepo)** | https://github.com/BootCamp-Codeit/snack |
| **프론트 (Vercel)** | _(포트폴리오 배포 예정)_ |
| **백엔드 (Render)** | _(포트폴리오 배포 예정)_ |
| **팀 FE (레거시)** | https://frontend042.vercel.app |
| **팀 BE (레거시)** | https://anjgkwl.n-e.kr |
| **Render 백업** | https://snack-xlvk.onrender.com |
| **로컬 FE** | `http://localhost:3000` | `next dev` |
| **로컬 BE** | `http://localhost:3000` | 포트 충돌 시 FE `3001` 등 |

### 배포 상태 (BE와 동일)

| 구분 | 내용 |
|------|------|
| **설계 목표** | AWS EC2 + Docker + Nginx (`snack-BE/snack/deploy/README.md`) |
| **현재** | EC2 **비용으로 중단**, 재구축 **예정** |

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
NEXT_PUBLIC_API_BASE_URL=https://anjgkwl.n-e.kr
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

정의: `src/lib/env.ts` — 미설정 시 기본값 `https://snack-xlvk.onrender.com`.

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

- [ ] Vercel `NEXT_PUBLIC_API_BASE_URL` = 현재 운영 BE (`anjgkwl.n-e.kr` 등)  
- [ ] BE CORS·`FRONTEND_URL`에 Vercel 도메인  
- [ ] 로그인 → localStorage 토큰 → 장바구니·구매 요청 동작  
- [ ] 도메인 변경 시 FE env + BE README + Swagger URL 동시 갱신  
- [ ] EC2 복구 후 env·README에서 임시 도메인 문구 정리  

---

# 👥 관련 저장소

| Repo | 역할 |
|------|------|
| [BootCamp-Codeit/snack](https://github.com/BootCamp-Codeit/snack) | **포트폴리오 monorepo** (본 repo) |
| [Codeit-Snack/frontend](https://github.com/Codeit-Snack/frontend) | 팀 원본 FE |
| [Codeit-Snack/backend](https://github.com/Codeit-Snack/backend) | 팀 원본 BE |
