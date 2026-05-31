#!/usr/bin/env bash
# EC2에서 RDS → Compose MySQL 데이터 이전
# 사용: cd ~/snack/backend && bash deploy/migrate-rds-to-ec2-mysql.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
COMPOSE="docker compose -f deploy/docker-compose.ec2.yml"
BACKUP="${ROOT}/snack-rds-backup-$(date +%Y%m%d-%H%M%S).sql"

if [ ! -f .env ]; then
  echo "❌ .env 없음. backend/.env 를 준비하세요." >&2
  exit 1
fi

# shellcheck disable=SC1091
set -a
source .env
set +a

for var in RDS_HOST RDS_USER RDS_PASSWORD MYSQL_ROOT_PASSWORD MYSQL_PASSWORD; do
  if [ -z "${!var:-}" ]; then
    echo "❌ .env 에 ${var} 가 필요합니다." >&2
    exit 1
  fi
done

RDS_DB="${RDS_DATABASE:-snack}"
MYSQL_DB="${MYSQL_DATABASE:-snack}"

echo "▶ 1/5 MySQL 컨테이너 기동..."
$COMPOSE up -d mysql
echo "   MySQL healthy 대기..."
until $COMPOSE exec -T mysql mysqladmin ping -h 127.0.0.1 -uroot -p"${MYSQL_ROOT_PASSWORD}" --silent 2>/dev/null; do
  sleep 2
done

echo "▶ 2/5 RDS 덤프 → ${BACKUP}"
docker run --rm mysql:8.0 mysqldump \
  -h "${RDS_HOST}" \
  -P "${RDS_PORT:-3306}" \
  -u "${RDS_USER}" \
  -p"${RDS_PASSWORD}" \
  --single-transaction \
  --routines \
  --triggers \
  --set-gtid-purged=OFF \
  "${RDS_DB}" > "${BACKUP}"

SIZE="$(wc -c < "${BACKUP}" | tr -d ' ')"
if [ "${SIZE}" -lt 1000 ]; then
  echo "❌ 덤프 파일이 너무 작습니다 (${SIZE} bytes). RDS 접속 정보를 확인하세요." >&2
  exit 1
fi
echo "   덤프 완료: ${BACKUP} (${SIZE} bytes)"

echo "▶ 3/5 EC2 MySQL에 복원..."
$COMPOSE exec -T mysql mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" -e \
  "DROP DATABASE IF EXISTS \`${MYSQL_DB}\`; CREATE DATABASE \`${MYSQL_DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;"
cat "${BACKUP}" | $COMPOSE exec -T mysql mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" "${MYSQL_DB}"

echo "▶ 4/5 앱 계정 권한 (snack 사용자)..."
$COMPOSE exec -T mysql mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" -e \
  "GRANT ALL PRIVILEGES ON \`${MYSQL_DB}\`.* TO '${MYSQL_USER:-snack}'@'%'; FLUSH PRIVILEGES;"

echo "▶ 5/5 행 수 확인"
$COMPOSE exec -T mysql mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" "${MYSQL_DB}" -e \
  "SELECT 'users' t, COUNT(*) c FROM users
   UNION SELECT 'products', COUNT(*) FROM products
   UNION SELECT 'purchase_requests', COUNT(*) FROM purchase_requests;"

echo ""
echo "✅ 복원 완료."
echo ""
echo "다음: .env 의 DATABASE_URL 을 Compose MySQL 로 변경 후 API 재기동"
echo "  DATABASE_URL=mysql://${MYSQL_USER:-snack}:<MYSQL_PASSWORD>@mysql:3306/${MYSQL_DB}"
echo ""
echo "  $COMPOSE up -d --force-recreate snack-api"
echo "  curl -s http://127.0.0.1:3000/api/health"
echo ""
echo "검증 후 RDS 콘솔에서 인스턴스 삭제. 백업 파일: ${BACKUP}"
