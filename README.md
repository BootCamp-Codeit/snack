# SNACK (간식 구매·예산 관리)

Codeit 풀스택 10기 팀 프로젝트 · **FE + BE monorepo**  
조직(기업) 단위 **간식 카탈로그·장바구니·구매 요청·판매자 승인·월별 예산·지출** B2B 플랫폼

> 개인 포트폴리오용 fork · Organization: [BootCamp-Codeit](https://github.com/BootCamp-Codeit)

---

## Live Demo

| | URL |
|--|-----|
| **Frontend (Vercel)** | https://snack-gray.vercel.app |
| **Backend API (EC2)** | https://ssnackk.duckdns.org |
| **Swagger** | https://ssnackk.duckdns.org/api/docs |
| **GitHub** | https://github.com/BootCamp-Codeit/snack |

---

## 데모 체험 (시드 데이터)

비밀번호 공통: **`qwert12345!`**

### 구매자 — 코드잇 10기 마케팅팀

| 역할 | 이메일 | 이름 | 체험 포인트 |
|------|--------|------|-------------|
| SUPER_ADMIN | `demo@snack.dev` | 김명환 | 예산·멤버(8명)·조직 설정 |
| ADMIN | `admin@snack.dev` | 이관리 | 구매 요청 · **장바구니 2품목** |
| ADMIN | `ops@snack.dev` | 한운영 | 구매 요청 이력 |
| MEMBER | `member@snack.dev` | 박멤버 | **장바구니 4품목** · 구매 요청 |
| MEMBER | `design@snack.dev` | 최디자인 | 구매 요청(승인 대기) |
| MEMBER | `content@snack.dev` | 정콘텐츠 | 취소된 요청 이력 |
| MEMBER | `intern@snack.dev` | 강인턴 | 초대 수락 멤버 |
| MEMBER | `left@snack.dev` | 조퇴사 | **비활성** 멤버 (회원 관리) |

### 판매자 — Snack B2B 공급센터

| 역할 | 이메일 | 이름 | 체험 포인트 |
|------|--------|------|-------------|
| SUPER_ADMIN | `supplier@snack.dev` | 최공급 | **PO 승인·거절·발주** (`/admin/purchase-manage`) |
| ADMIN | `catalog@snack.dev` | 오카탈로그 | 상품 등록 내역 |
| MEMBER | `dispatch@snack.dev` | 윤배송 | 발주·배송 처리 |

### 시드에 포함된 운영 데이터

| 항목 | 내용 |
|------|------|
| 상품 | **33건** — 구매자·판매자 조직 각각 카탈로그 (상품 리스트는 **구매자 조직** 기준) |
| 장바구니 | member 4품목 · admin 2품목 |
| 구매 요청 | **7건** — 완료 2 · 승인 · 대기 2 · 거절 · 취소 |
| 예산 | 3개월 (50만·50만·45만) |
| 초대 | `newhire@snack.dev` · `contractor@snack.dev` 대기 · `intern@` 수락 이력 |
| 감사 로그 | 구매·승인·예산·초대·상품등록 샘플 |

### 시드 실행

```bash
# 로컬 (backend/.env → DATABASE_URL)
cd backend && npm run db:seed

# EC2 (RDS 연결된 컨테이너 — seed 파일 반영 후)
docker cp prisma/seed.js snack-api:/app/prisma/seed.js
docker cp prisma/seed-data.js snack-api:/app/prisma/seed-data.js
docker exec snack-api node prisma/seed.js
```

> **주의:** `db:seed`는 **전 테이블 삭제(deleteMany) 후 재생성**입니다. 운영 DB에서는 신중히 실행하세요.  
> API 서버(EC2)는 **월~금 12:00~18:00(KST)** 운영 스케줄일 수 있습니다 — FE(Vercel)는 상시 접속 가능.

---

## Repository Layout

| 경로 | 설명 | README |
|------|------|--------|
| `frontend/` | Next.js 16 · TypeScript · shadcn/ui | [frontend/README.md](./frontend/README.md) |
| `backend/` | NestJS · Prisma · Swagger | [backend/README.md](./backend/README.md) |
| `backend/deploy/` | EC2 Docker Compose · Nginx | [backend/deploy/README.md](./backend/deploy/README.md) |

팀 BE는 `backend/snack/` 중첩 구조였으나, monorepo에서는 **`backend/` = Nest 앱 루트**로 flatten 했습니다.

---

## Quick Start (로컬)

```bash
# 1) Backend
cd backend
cp .env.example .env
docker compose up -d
npm install
npx prisma migrate deploy
npm run db:seed
npm run start:dev

# 2) Frontend
cd frontend
cp .env.example .env.local
# NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
npm install
npm run dev
```

| 로컬 URL | |
|----------|--|
| FE | http://localhost:3000 (포트 충돌 시 `next dev -p 3001`) |
| BE | http://localhost:3000 |
| Swagger | http://localhost:3000/api/docs |

---

## 배포 아키텍처 (포트폴리오)

```
[브라우저] → Vercel (FE) → HTTPS → EC2 Nginx → Docker (NestJS + Redis)
                                              ↓
                                         AWS RDS MySQL
```

| 구분 | 스택 |
|------|------|
| FE | Vercel · `NEXT_PUBLIC_API_BASE_URL=https://ssnackk.duckdns.org` |
| BE | EC2 t3.micro · Docker Compose · DuckDNS + Let's Encrypt |
| DB | AWS RDS MySQL (us-east-1, VPC 내 EC2와 SG 연동) |
| Redis | Docker Compose 내부 (`snack-redis`) |

Render/TiDB 기반 팀 배포 URL은 [팀 원본](#팀-원본-참고) 참고.

---

## Repository

| 구분 | Organization / Repo |
|------|---------------------|
| **포트폴리오 (본 repo)** | [BootCamp-Codeit/snack](https://github.com/BootCamp-Codeit/snack) |
| **팀 org (원본)** | [Codeit-Snack](https://github.com/Codeit-Snack) |
| **팀 FE** | [frontend](https://github.com/Codeit-Snack/frontend) |
| **팀 BE** | [backend](https://github.com/Codeit-Snack/backend) |

---

## 포트폴리오 마이그레이션 요약 (2026-05)

| 작업 | 내용 |
|------|------|
| monorepo | `BootCamp-Codeit/snack` — `frontend/` + `backend/` |
| FE | Vercel `snack-gray.vercel.app` |
| BE | EC2 + RDS + DuckDNS `ssnackk.duckdns.org` |
| DB | Prisma migrate deploy · MariaDB adapter + RDS |
| 데모 시드 | 구매·승인·예산·초대·감사 로그 포함 운영형 데이터 |
| 문서 | README 3종 + 날짜별 트러블슈팅 |

---

## 트러블슈팅 (배포)

| 증상 | 원인 | 조치 |
|------|------|------|
| signup/login **500 (~10초)** | Nest `PrismaService`의 `$connect()` + MariaDB adapter 풀 이슈 | `prisma.service.ts` — `$queryRaw SELECT 1`로 기동 검증 ([Prisma #28879](https://github.com/prisma/prisma/issues/28879)) |
| `/api/health` OK인데 DB 실패 | health는 DB 미검사 | `/api/health/db` + `HEALTH_DB_SECRET` 또는 signup 직접 테스트 |
| Docker build **disk full** | EBS 8GB | 볼륨 20GB 확장 + `growpart` / `resize2fs` |
| `DATABASE_URL=localhost` | 컨테이너 내부 localhost | RDS 엔드포인트로 수정 |
| RDS **Host blocked** | 연결 실패 누적 | RDS 재부팅 또는 `FLUSH HOSTS` |
| Docker **CACHED** 빌드 | 소스 미반영 | `build --no-cache snack-api` |
| `git pull` 후에도 옛 코드 | EC2만 수정·미 push | GitHub push → EC2 pull → 재빌드 |

상세 → [backend/README.md](./backend/README.md) · [frontend/README.md](./frontend/README.md)

---

## 팀 원본 (참고)

| | URL |
|--|-----|
| FE (팀) | https://frontend042.vercel.app |
| BE (팀) | https://anjgkwl.n-e.kr |
| Render | https://snack-xlvk.onrender.com |

---

상세 API·비즈니스 규칙 → [backend/README.md](./backend/README.md) · Swagger
