#!/bin/bash
# Restores a backup created by backup.sh (overwrites the catalogue databases).
#   scripts/restore.sh backups/db/lumina-YYYYMMDD-HHMMSS.sql.gz
set -euo pipefail
cd "$(dirname "$0")/.."
FILE="${1:?Specify the backup file, e.g. backups/db/lumina-20260101-030000.sql.gz}"
[ -f "$FILE" ] || { echo "File not found: $FILE" >&2; exit 1; }
gzip -t "$FILE"
read -r -p "The current catalogue will be REPLACED with $FILE. Continue? [y/N] " ok
case "$ok" in [yYsS]*) ;; *) echo "Cancelled"; exit 0 ;; esac
gunzip -c "$FILE" | docker compose exec -T mysqldb sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -u root'
docker compose restart nodeapp
echo "Restore completed"
