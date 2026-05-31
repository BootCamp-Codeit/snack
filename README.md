# SNACK (간식 구매·예산 관리)

Codeit 풀스택 10기 팀 프로젝트 · **FE + BE monorepo**  
조직(기업) 단위 **간식 카탈로그·장바구니·구매 요청·판매자 승인·월별 예산·지출** B2B 플랫폼

> 개인 포트폴리오용 fork · Organization: [BootCamp-Codeit](https://github.com/BootCamp-Codeit)

---

## Live Demo

| | URL |
|--|-----|
| **Frontend (Vercel)** | _(배포 예정)_ |
| **Backend API (Render)** | _(배포 예정)_ |
| **Swagger** | `{BE_URL}/api/docs` |
| **GitHub** | https://github.com/BootCamp-Codeit/snack |

### 팀 원본 배포 (참고)

| | URL |
|--|-----|
| FE (팀) | https://frontend042.vercel.app |
| BE (팀·임시) | https://anjgkwl.n-e.kr |
| Render 백업 | https://snack-xlvk.onrender.com |

> EC2 운영은 비용으로 중단된 상태. 포트폴리오는 **Vercel + Render + TiDB(또는 Docker MySQL)** 로 재배포 예정.

---

## Repository Layout

| 경로 | 설명 | README |
|------|------|--------|
| `frontend/` | Next.js 16 · TypeScript · shadcn/ui | [frontend/README.md](./frontend/README.md) |
| `backend/` | NestJS · Prisma · Swagger | [backend/README.md](./backend/README.md) |

팀 BE는 `backend/snack/` 중첩 구조였으나, monorepo에서는 **`backend/` = Nest 앱 루트**로 flatten 했습니다.

---

## Quick Start (로컬)

```bash
# 1) Backend
cd backend
cp .env.example .env
docker compose up -d    # MySQL (+ Redis 등)
npm install
npx prisma migrate deploy   # 또는 db push (로컬)
npm run start:dev

# 2) Frontend (다른 터미널)
cd frontend
cp .env.example .env.local
# NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
npm install
npm run dev
```

| 로컬 URL | |
|----------|--|
| FE | http://localhost:3000 (BE와 포트 겹치면 `next dev -p 3001`) |
| BE | http://localhost:3000 |
| Swagger | http://localhost:3000/api/docs |

---

## 배포 (monorepo) — favorite-photo / forest-of-study 와 동일 패턴

### Vercel (Frontend)

| 항목 | 값 |
|------|-----|
| Repository | `BootCamp-Codeit/snack` |
| **Root Directory** | `frontend` |
| Framework | Next.js |
| **Environment** | `NEXT_PUBLIC_API_BASE_URL=https://<render-url>` |

### Render (Backend)

| 항목 | 값 |
|------|-----|
| Repository | `BootCamp-Codeit/snack` |
| **Root Directory** | `backend` |
| Runtime | **Docker** (`backend/Dockerfile`) |
| Health | `/api/health` |
| **Environment** | `DATABASE_URL`, `JWT_*`, `CORS_ORIGIN`, `FRONTEND_URL` 등 (`.env.example` 참고) |

### Database

- 로컬: `backend/docker compose`
- 배포: **TiDB Cloud** (MySQL 호환) 또는 Render 외부 MySQL — Prisma `DATABASE_URL`

---

## Repository

| 구분 | Organization / Repo |
|------|---------------------|
| **포트폴리오 (본 repo)** | [BootCamp-Codeit/snack](https://github.com/BootCamp-Codeit/snack) |
| **팀 org (원본)** | [Codeit-Snack](https://github.com/Codeit-Snack) |
| **팀 FE** | [frontend](https://github.com/Codeit-Snack/frontend) |
| **팀 BE** | [backend](https://github.com/Codeit-Snack/backend) |

---

## 다음 단계 (진행 예정)

1. ~~GitHub `BootCamp-Codeit/snack` push~~ ✅
2. TiDB(또는 MySQL) + `prisma migrate deploy`
3. Render BE 배포 → Vercel FE `NEXT_PUBLIC_API_BASE_URL` 연결
4. CORS·Swagger·로그인 E2E 확인
5. (선택) 데모 조직·시드 데이터

상세 API·비즈니스 규칙 → [backend/README.md](./backend/README.md) · Swagger
