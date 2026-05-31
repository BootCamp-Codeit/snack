# 📘 SNACK API

이 프로젝트는 **조직(기업) 단위 간식 구매·예산 관리**를 위한 B2B 백엔드입니다.  
**카탈로그·장바구니·구매 요청·판매자 주문 승인·월별 예산·예산 예약·지출·감사 로그** 흐름을 제공합니다.

> monorepo: [BootCamp-Codeit/snack](https://github.com/BootCamp-Codeit/snack) · Render Root Directory: **`backend`**

---

# 🚀 Base URL

- 모든 요청·응답은 **JSON** 형식입니다.
- API 경로 앞에는 전역 prefix **`/api`** 가 붙습니다.
- 로컬 개발 기본 포트: **3000**

| 환경 | URL | 비고 |
|------|-----|------|
| 로컬 | `http://localhost:3000` | 개발용 |
| **포트폴리오 운영 API** | `https://ssnackk.duckdns.org` | EC2 + RDS + Nginx TLS |
| **프론트 (Vercel)** | `https://snack-gray.vercel.app` | `NEXT_PUBLIC_API_BASE_URL` 연동 |
| Render (백업) | `https://snack-xlvk.onrender.com` | CI·keep-alive |
| 팀 BE (레거시) | `https://anjgkwl.n-e.kr` | 참고용 |

헬스체크:

```
GET https://ssnackk.duckdns.org/api/health
GET https://ssnackk.duckdns.org/api/health/db   # HEALTH_DB_SECRET 헤더 필요(프로덕션)
```

### 배포 상태 (운영)

| 구분 | 내용 |
|------|------|
| **인프라** | AWS EC2 (t3.micro) + **RDS MySQL** + Docker Compose + Nginx + Let's Encrypt |
| **도메인** | DuckDNS `ssnackk.duckdns.org` → Elastic IP |
| **Redis** | Compose 내부 `snack-redis` (호스트 미노출) |
| **가이드** | [deploy/README.md](./deploy/README.md) |

> URL 변경 시 **Base URL 표** · Vercel env · [docs/TEAM.md](./docs/TEAM.md) · 루트 README를 함께 갱신하세요.

---

# 🌱 데모 시드 (`npm run db:seed`)

채용 담당자·리뷰어가 **실제 운영 흐름**을 바로 볼 수 있도록 구매·승인·예산·초대 데이터를 넣습니다.

| 항목 | 내용 |
|------|------|
| 구매자 조직 | 코드잇 10기 마케팅팀 — `demo@` / `admin@` / `ops@` / `member@` / `design@` / `content@` / `intern@` / `left@snack.dev` |
| 판매자 조직 | Snack B2B 공급센터 — `supplier@` / `catalog@` / `dispatch@snack.dev` |
| 비밀번호 | `qwert12345!` (공통) |
| 상품 | **33건** (구매자·판매자 조직 각각 — 상품 리스트는 구매자 JWT 조직 기준) |
| 장바구니 | member 4품목 · admin 2품목 |
| 구매 요청 | 7건 (PURCHASED×2 · READY_TO_PURCHASE · OPEN×2 · REJECTED · CANCELED) |
| 예산 | 3개월 |
| 초대 | PENDING 2건 + ACCEPTED 이력 |

```bash
# 로컬
npm run db:seed

# EC2
docker cp prisma/seed.js snack-api:/app/prisma/seed.js
docker cp prisma/seed-data.js snack-api:/app/prisma/seed-data.js
docker exec snack-api node prisma/seed.js
```

> **전체 deleteMany 후 재생성** — 운영 DB 주의. 시나리오는 `prisma/seed-data.js`에서 수정.

---

# 🧱 API 구조

API는 다음 도메인으로 구성됩니다:

| 영역 | Prefix | 기능 |
|------|--------|------|
| **Auth** | `/api/auth` | 회원가입·로그인·토큰 갱신·비밀번호 찾기/변경 |
| **Users** | `/api/users` | 사용자 프로필 |
| **Organizations** | `/api/organizations` | 조직·멤버·역할(`OrgRole`) 관리 |
| **Invitations** | `/api/invitations` | 조직 초대·수락 |
| **Categories / Products** | `/api/categories`, `/api/products` | 판매 카탈로그 |
| **Cart** | `/api/cart` | 구매자 조직·사용자별 장바구니 |
| **PurchaseRequest** | `/api/purchase-requests` | 장바구니 → 구매 요청 스냅샷 |
| **SellerOrder** | `/api/seller/purchase-orders` | 판매자 PO 조회·승인·거절·구매 완료 |
| **Budget** | `/api/budget/*` | 월별 예산·기본값·예산 예약 |
| **Expenses** | `/api/expenses` | 구매 완료 후 지출 확정 |
| **Audit** | `/api/audit-logs` | 감사 로그 조회 |
| **Health** | `/api/health` | 서비스·DB 상태 |

Swagger 문서로 전체 API 확인 가능:

| 항목 | URL |
|------|-----|
| Swagger UI | `{BASE_URL}/api/docs` |
| OpenAPI JSON | `{BASE_URL}/api/openapi.json` |
| OpenAPI YAML | `{BASE_URL}/api/openapi.yaml` |

> 스펙은 `@nestjs/swagger` 데코레이터에서 **자동 생성**됩니다. 코드 변경이 곧 API 문서 변경입니다.

팀 연동용 요약: [docs/TEAM.md](./docs/TEAM.md)

---

# ✅ 공통 성공 응답 형식

전역 `ResponseInterceptor`로 래핑됩니다.

```json
{
  "success": true,
  "data": { }
}
```

---

# ⚠️ 공통 에러 응답 형식

`HttpExceptionFilter` 기준:

```json
{
  "success": false,
  "statusCode": 400,
  "errorCode": "VALIDATION_FAILED",
  "path": "/api/...",
  "timestamp": "2026-05-28T12:00:00.000Z",
  "message": "에러 설명"
}
```

### 공통 상태 코드

| 코드 | 의미 |
|------|------|
| 400 | 잘못된 요청 (ValidationPipe 실패 등) |
| 401 | 인증 필요 / 토큰 무효 |
| 403 | 권한 없음 (역할·조직 불일치) |
| 404 | 존재하지 않는 리소스 |
| 409 | 충돌 (중복 가입, **예산 부족**, 이미 예약된 PO 등) |
| 429 | 전역 rate limit (`THROTTLE_TTL`초당 `THROTTLE_LIMIT`회, 기본 60초당 70회) |
| 500 | 서버 내부 에러 (production에서는 message 일반화) |

---

# 🔐 인증 (프론트 필수)

1. `POST /api/auth/login` (또는 `signup` 후 `issueAuthTokens`)  
2. 응답 `data.tokens.accessToken` 저장  
3. 이후 요청: **`Authorization: Bearer <accessToken>`**  
4. Swagger: **Authorize** → Bearer에 토큰 입력  

JWT payload (`JwtPayload`):

| 필드 | 설명 |
|------|------|
| `sub` | 사용자 ID |
| `email` | 이메일 |
| `organizationId` | **현재 조직** (장바구니·구매·판매 주문·예산의 기준) |
| `role` | 조직 내 역할 `OrgRole` |
| `sessionId` | 세션 식별 |

CORS: `credentials: true`, `Authorization` 헤더 허용.

공개(인증 불필요) 예: `POST /api/auth/signup`, `login`, `refresh`, `forgot-password`, `reset-password`, 초대 토큰 조회 등 — 상세는 Swagger **Auth**, **Invitations** 태그 참고.

---

# 📚 도메인 규칙 설명

Swagger만으로는 “왜 이렇게 동작하는지”가 드러나지 않는 부분을 정리했습니다.

---

## 🟦 1. Organizations (조직·권한)

- **개인/기업 `OrgType` 구분 없음.** 조직은 `name` + 선택적 `businessNumber`만 가집니다.
- 권한은 **멤버십 `OrgRole`** 로만 구분합니다.

| `OrgRole` | 설명 |
|-----------|------|
| `MEMBER` | 일반 구매 요청·장바구니 |
| `ADMIN` | 조직 관리·즉시 구매 등 관리자 기능 |
| `SUPER_ADMIN` | 최고 관리자 (예산 수동 보정·멤버 역할 변경 등) |

회원가입 시 새 조직을 만들면 해당 사용자는 보통 **`SUPER_ADMIN`** 으로 등록됩니다.

---

## 🟩 2. Cart → PurchaseRequest (구매자)

1. `GET/POST/PATCH/DELETE /api/cart/*` — **JWT `organizationId` + 사용자** 기준 장바구니  
2. `POST /api/purchase-requests` — 현재 장바구니를 **구매 요청 스냅샷**으로 만들고 **카트 비움**  
3. 판매자 조직별로 PO(`SellerOrder`)가 갈라져 생성됨  

**즉시 구매 (`instantCheckout`)**  
- `ADMIN` / `SUPER_ADMIN` 전용  
- 자체 판매 상품만 있을 때 승인·구매완료·지출까지 한 트랜잭션으로 처리  
- `MEMBER`가 요청하면 **403**, 예산 부족 시 **409**

`PurchaseRequestStatus` 예: `OPEN` → `PARTIALLY_APPROVED` → `READY_TO_PURCHASE` → `PURCHASED` / `REJECTED` / `CANCELED`

---

## 🟨 3. SellerOrder (판매자 PO)

- 경로 prefix: `/api/seller/purchase-orders`  
- JWT의 **`organizationId` = 판매자 조직** 기준으로 목록·상세·승인  

**승인 (`POST .../approve`)** — 핵심 비즈니스 규칙:

- 상태: `PENDING_SELLER_APPROVAL` → `APPROVED`  
- **같은 Prisma `$transaction`** 안에서 구매자 조직의 **월 가용 예산**으로  
  `items_amount + shipping_fee` 만큼 **예산 예약(`budget_reservations`, ACTIVE)** 생성  
- 가용액 부족 → **409**  
- 해당 PO에 이미 예약이 있으면 중복 생성하지 않음  

거절·취소 시 예약은 **RELEASED** 등으로 해제됩니다.

---

## 🟧 4. Budget (예산·예약)

| 개념 | 설명 |
|------|------|
| `budget_periods` | 구매자 조직 **연·월별** 예산 상한 (없으면 `default_monthly_budget`로 자동 생성) |
| `budget_reservations` | **PO당 1건** — `ACTIVE` → `CONSUMED` / `RELEASED` |
| `POST /api/budget/reservations` | 수동 예약(보통 SUPER_ADMIN 보정). 이미 PO 예약 있으면 **409** |

**판매자 승인 시 예약이 자동 생성**되므로, 프론트는 보통 수동 예약 API를 쓰지 않습니다.

관련 API:

- `GET/PATCH /api/budget/periods` — 월별 예산  
- `GET/PATCH /api/budget/monthly-default` — 조직 기본 월 예산  
- `GET/POST/PATCH /api/budget/reservations` — 예약 조회·생성·상태 변경  

---

## 🟥 5. Expenses (지출)

- PO가 **`PURCHASED`** 된 뒤 `POST /api/expenses` 로 지출 확정  
- 해당 PO에 **ACTIVE 예약**이 있으면 자동 **`CONSUMED`** 처리  

---

## 🟪 6. Audit (감사 로그)

- 주요 상태 변경·승인·예산 작업 등이 `audit_logs`에 기록  
- `GET /api/audit-logs` — 조직·기간 등 쿼리로 조회 (권한은 Swagger·서비스 로직 참고)

---

# 🛠 로컬 실행

```bash
cp .env.example .env
docker compose up -d    # MySQL (+ Redis 등 compose 정의에 따름)
npm install
npm run start:dev
```

| 명령 | 설명 |
|------|------|
| `npm run start:dev` | 개발 서버 (watch) |
| `npm run build` / `start:prod` | 프로덕션 빌드·실행 |
| `npm run compose:up` | Docker Compose 기동 |
| `npm run db:seed` | 데모 데이터 전체 재생성 (deleteMany) |
| `npm run test` | 단위 테스트 |
| `npm run test:e2e` | E2E (`test/flow.e2e-spec.ts`, `RUN_FLOW_E2E=1` 시 전체 플로우) |

배포(EC2·PM2·GitHub Actions): [deploy/README.md](./deploy/README.md)

---

# 📁 폴더 구조 (요약)

```
backend/
├── prisma/              # schema, migrations
├── src/
│   ├── auth/
│   ├── organizations/
│   ├── modules/         # catalog, cart, purchase-request, seller-order, finance …
│   ├── common/
│   └── main.ts          # Swagger, CORS, rate limit
├── test/
├── docs/
├── dbml/
├── Dockerfile
└── render.yaml
```

---

# 🔗 FE 연동 시 체크리스트

- [x] `NEXT_PUBLIC_API_BASE_URL` = `https://ssnackk.duckdns.org`  
- [x] `FRONTEND_URL` = `https://snack-gray.vercel.app`  
- [ ] API 호출 시 `Authorization: Bearer`  
- [ ] Swagger `{BASE_URL}/api/docs`에서 토큰 **Authorize** 후 플로우 검증  
- [ ] 구매 플로우: Cart → PurchaseRequest → Seller approve → (예산 예약) → Purchase → Expense  
- [ ] 409 응답: 예산 부족·중복 예약 등 — UI 메시지 분기  

---

## 8. 트러블슈팅 (대표)

| 증상 | 원인 | 조치 |
|------|------|------|
| signup/login **500 (~10초)** | MariaDB adapter + Nest `$connect()` 풀 타임아웃 | `prisma.service.ts`: `$connect()` 제거 → `$queryRaw SELECT 1` 기동 검증 |
| `/api/health` OK · DB 실패 | health는 DB 미검사 | `/api/health/db` + `HEALTH_DB_SECRET` |
| `allowPublicKeyRetrieval` 있어도 500 | 위 풀 이슈와 별개로 `$connect`가 원인 | EC2 dist에 `Database ready` 로그 확인 |
| Docker build **CACHED** | 소스 미반영 | `build --no-cache snack-api` |
| EBS **disk full** | 8GB | 20GB 확장 + `growpart` / `resize2fs` |
| RDS **Host blocked** | 잘못된 연결 반복 | RDS 재부팅 |
| `DATABASE_URL=localhost` | 컨테이너에 DB 없음 | RDS 엔드포인트 + 비밀번호 URL 인코딩 (`!` → `%21`) |
| migrate 루프 | RDS 일시 불가 | `SKIP_MIGRATIONS=true` (이후 `migrate deploy` 수동) |
| NODE_ENV=development 무반응 | compose가 `production` 강제 | compose env 또는 일시적 override |

---

## 9. 개발·배포 리포트 (날짜별)

### 2026-05-28 ~ 05-30 · EC2 + RDS + Vercel monorepo 배포

**상황**  
팀 Render/TiDB 대신 **EC2 + RDS** 로 포트폴리오 BE 재배포. FE는 Vercel.

**선택 & 이유**  
- **Docker Compose** — Redis·API 한 스택, [deploy/docker-compose.ec2.yml](./deploy/docker-compose.ec2.yml)  
- **DuckDNS + Let's Encrypt** — 고정 IP HTTPS  
- **Prisma MariaDB adapter** + `allowPublicKeyRetrieval` — AWS RDS MySQL 인증  

**트러블슈팅**  
- EBS 8GB → Docker build 실패 → **20GB 확장**  
- `DATABASE_URL` localhost → RDS endpoint 수정  
- migrate 실패 루프 → `SKIP_MIGRATIONS=true`  

---

### 2026-05-31 · signup 500 (~10초) — PrismaService `$connect()` 

**상황**  
배포 후 `/api/health` 200이지만 **signup·login 500**, 응답까지 **정확히 ~10초**.  
`docker exec`로 **새 PrismaClient** 직접 쿼리는 **387ms**에 성공.

**검토**  
- `ConfigService` vs `process.env` `DATABASE_URL` → **동일(EQUAL: true)**  
- `/api/health`는 DB를 검사하지 않음  
- MariaDB adapter + Nest 싱글톤 `$connect()` → 이후 쿼리 pool timeout ([Prisma #28879](https://github.com/prisma/prisma/issues/28879))

**선택 & 이유**  
- `onModuleInit`의 **`$connect()` 제거**  
- **`$queryRaw\`SELECT 1\``** 로 기동 시 DB 검증 + `Database ready (Nms)` 로그  
- `process.env.DATABASE_URL` 우선 resolve  

**결과**  
- `Database ready (236ms)` · `Nest application successfully started +6ms`  
- `/api/health/db` **0.05s** · signup **0.76s** · `success: true`  

---

### 2026-05-31 · 운영형 데모 시드

**상황**  
채용 담당자가 로그인만으로 **구매·승인·예산·초대** 흐름을 볼 수 있게 데이터 필요.

**선택 & 이유**  
- **구매자·판매자 2조직** — B2B 카탈로그·PO 승인 분리  
- 구매자 조직에 **33상품 카탈로그** 시드 (상품 리스트 API는 JWT `organizationId` 기준)  
- 구매 요청 **7건** + 회원 **8명** + 장바구니 + 초대 + 감사 로그  
- MariaDB FK 제약 → `TRUNCATE` 대신 **`deleteMany` 순서 삭제**  
- `prisma/seed.js` + `seed-data.js` — EC2에서 `docker cp` 후 `node prisma/seed.js`  

**결과**  
루트 README 데모 계정 · Swagger · FE 화면에서 end-to-end 체험 가능.

---

# 👥 팀·CI

- 팀 온보딩: [docs/TEAM.md](./docs/TEAM.md)  
- GitHub Actions: `.github/workflows/backend-ci.yml` (lint·test)  
- **EC2 배포 가이드**: [deploy/README.md](./deploy/README.md)  
- Render: `render.yaml` — keep-alive·백업
