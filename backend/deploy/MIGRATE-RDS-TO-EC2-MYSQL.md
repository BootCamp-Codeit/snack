# RDS → EC2 Docker MySQL 마이그레이션

Snack 포트폴리오 비용 절감: **RDS 대신 EC2 Compose 내부 MySQL** 사용.

> API 컨테이너에서 DB 호스트명은 **`mysql`** (서비스명) 입니다.

---

## 1. `.env`에 추가 (기존 RDS 값은 덤프용으로 유지)

```bash
cd ~/snack/backend
nano .env
```

**RDS 덤프용 (마이그레이션 후 삭제 가능):**

```env
RDS_HOST=snack.xxxxx.us-east-1.rds.amazonaws.com
RDS_PORT=3306
RDS_USER=admin
RDS_PASSWORD=your_rds_password
RDS_DATABASE=snack
```

**EC2 MySQL (새로 설정 — 강한 비밀번호 사용):**

```env
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_USER=snack
MYSQL_PASSWORD=your_snack_password
MYSQL_DATABASE=snack
```

**아직 RDS를 가리키는 `DATABASE_URL`은 마이그레이션 직후까지 그대로 두어도 됩니다.**

---

## 2. 코드 반영

```bash
git fetch origin main && git reset --hard origin/main
```

---

## 3. 덤프 + 복원 (자동 스크립트)

```bash
chmod +x deploy/migrate-rds-to-ec2-mysql.sh
bash deploy/migrate-rds-to-ec2-mysql.sh
```

`users` / `products` / `purchase_requests` 건수가 RDS와 맞는지 확인.

---

## 4. `DATABASE_URL` 전환

`.env`에서 **API가 사용할 URL**을 Compose MySQL로 변경:

```env
DATABASE_URL=mysql://snack:your_snack_password@mysql:3306/snack
```

비밀번호에 `!` `#` 등 특수문자가 있으면 URL 인코딩 (`!` → `%21`).

마이그레이션 직후 스키마는 덤프에 포함되므로:

```env
SKIP_MIGRATIONS=true
```

---

## 5. API 재기동

```bash
docker compose -f deploy/docker-compose.ec2.yml up -d --force-recreate snack-api
curl -s http://127.0.0.1:3000/api/health
curl -s -H "x-health-db-secret: YOUR_SECRET" http://127.0.0.1:3000/api/health/db
```

브라우저: https://snack-gray.vercel.app → `demo@snack.dev` 로그인.

---

## 6. RDS 삭제 (검증 후)

- 최종 스냅샷 1회 생성 (선택)
- RDS 인스턴스 **삭제**
- EC2 보안 그룹에서 RDS용 3306 인바운드 규칙 제거 (선택)

**Elastic IP는 EC2에 연결된 채 유지** (삭제하지 않음).

---

## 7. 롤백

`.env`의 `DATABASE_URL`을 RDS URL로 되돌리고:

```bash
docker compose -f deploy/docker-compose.ec2.yml up -d --force-recreate snack-api
```

---

## t3.micro 메모리

MySQL + Redis + API 동시 실행 시 RAM이 빡빡할 수 있습니다. OOM 시 **t3.small(2GB)** 업그레이드를 검토하세요. RDS 제거 비용으로 상쇄 가능합니다.
