#!/bin/bash
# Backup of the catalogue (main database + media database) to /backups/db.
# Runs in the docker-compose "backup" service (mysql image, which includes mysqldump).
#   backup.sh once   one backup right now
#   backup.sh loop   one backup a day at BACKUP_HOUR, kept for BACKUP_KEEP_DAYS days
set -euo pipefail

DIR=/backups/db
HOST="${DB_HOST:-mysqldb}"
KEEP="${BACKUP_KEEP_DAYS:-14}"
HOUR="${BACKUP_HOUR:-3}"
export MYSQL_PWD="${MYSQL_ROOT_PASSWORD:?MYSQL_ROOT_PASSWORD missing}"

mkdir -p "$DIR" /backups/excel
# The Excel exports folder is written by the app, which runs as user "node" (uid 1000)
chown 1000:1000 /backups/excel 2>/dev/null || true

run_backup() {
  local file="$DIR/lumina-$(date +%Y%m%d-%H%M%S).sql.gz"
  echo "[backup] $(date -Is) creating $file"
  mysqldump -h "$HOST" -u root --single-transaction --routines --triggers --hex-blob \
    --add-drop-database --databases "${DB_NAME:-luminadb}" "${MEDIA_DB_NAME:-luminamedia}" \
    | gzip -c > "$file.tmp"
  gzip -t "$file.tmp"            # corrupt backup = error, not an empty file passed off as good
  mv "$file.tmp" "$file"
  # Same owner as the folder on the host (the container runs as root)
  chown --reference="$DIR" "$file" 2>/dev/null || true
  find "$DIR" -name 'lumina-*.sql.gz' -mtime +"$KEEP" -delete
  echo "[backup] done ($(du -h "$file" | cut -f1)); $(ls "$DIR"/lumina-*.sql.gz | wc -l) backups kept"
}

wait_db() {
  until mysqladmin ping -h "$HOST" -u root --silent; do sleep 5; done
}

case "${1:-loop}" in
  once)
    wait_db
    run_backup
    ;;
  loop)
    wait_db
    echo "[backup] daily backup at ${HOUR}:00 (TZ=${TZ:-UTC}), kept for ${KEEP} days"
    while true; do
      now=$(date +%s)
      next=$(date -d "today ${HOUR}:00" +%s)
      [ "$next" -le "$now" ] && next=$(date -d "tomorrow ${HOUR}:00" +%s)
      sleep $((next - now))
      run_backup || echo "[backup] ERROR: backup failed" >&2
    done
    ;;
  *)
    echo "Usage: backup.sh once|loop" >&2
    exit 2
    ;;
esac
