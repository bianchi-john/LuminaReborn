#!/bin/bash
# Ripristina un backup creato da backup.sh (sovrascrive i database del catalogo).
#   scripts/restore.sh backups/db/lumina-AAAAMMGG-HHMMSS.sql.gz
set -euo pipefail
cd "$(dirname "$0")/.."
FILE="${1:?Indicare il file di backup, es. backups/db/lumina-20260101-030000.sql.gz}"
[ -f "$FILE" ] || { echo "File non trovato: $FILE" >&2; exit 1; }
gzip -t "$FILE"
read -r -p "Il catalogo attuale verrà SOSTITUITO con $FILE. Continuare? [s/N] " ok
[ "$ok" = "s" ] || [ "$ok" = "S" ] || { echo "Annullato"; exit 0; }
gunzip -c "$FILE" | docker compose exec -T mysqldb sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -u root'
docker compose restart nodeapp
echo "Ripristino completato"
