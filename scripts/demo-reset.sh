#!/bin/bash
# Resets the environment to its initial state: deletes the data (catalogue, images,
# users) and restarts, reloading the demo works and demo users.
#   scripts/demo-reset.sh        asks for confirmation
#   scripts/demo-reset.sh -y     no confirmation
set -euo pipefail
cd "$(dirname "$0")/.."
if [ "${1:-}" != "-y" ]; then
  read -r -p "All current data will be deleted and replaced with the demo data. Continue? [y/N] " ok
  case "$ok" in [yYsS]*) ;; *) echo "Cancelled"; exit 0 ;; esac
fi
if grep -qE '^(MYSQL|MONGO)_DATA_DIR=.+/' .env 2>/dev/null; then
  echo "Warning: .env uses host folders for the data (MYSQL_DATA_DIR/MONGO_DATA_DIR)." >&2
  echo "Empty them manually before continuing, or remove those variables." >&2
  exit 1
fi
docker network inspect extern >/dev/null 2>&1 || docker network create extern >/dev/null
docker compose down --volumes --remove-orphans
docker compose up -d --build
echo "Waiting for the application to be ready..."
for _ in $(seq 1 90); do
  if [ "$(docker inspect -f '{{.State.Health.Status}}' nodeappcontainer 2>/dev/null)" = healthy ]; then
    echo "Ready: http://localhost:${APP_PORT:-3000}"
    exit 0
  fi
  sleep 2
done
echo "The application does not seem to be ready: check with 'docker compose logs nodeapp'" >&2
exit 1
