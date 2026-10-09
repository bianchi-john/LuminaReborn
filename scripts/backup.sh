#!/bin/bash
# Backup del catalogo (database principale + database media) in /backups/db.
# Gira nel servizio "backup" di docker-compose (immagine mysql, che contiene mysqldump).
#   backup.sh once   un backup subito
#   backup.sh loop   un backup al giorno all'ora BACKUP_HOUR, conservati BACKUP_KEEP_DAYS giorni
set -euo pipefail

DIR=/backups/db
HOST="${DB_HOST:-mysqldb}"
KEEP="${BACKUP_KEEP_DAYS:-14}"
HOUR="${BACKUP_HOUR:-3}"
export MYSQL_PWD="${MYSQL_ROOT_PASSWORD:?MYSQL_ROOT_PASSWORD mancante}"

mkdir -p "$DIR" /backups/excel
# La cartella delle esportazioni Excel è scritta dall'app, che gira come utente "node" (uid 1000)
chown 1000:1000 /backups/excel 2>/dev/null || true

run_backup() {
  local file="$DIR/lumina-$(date +%Y%m%d-%H%M%S).sql.gz"
  echo "[backup] $(date -Is) creo $file"
  mysqldump -h "$HOST" -u root --single-transaction --routines --triggers --hex-blob \
    --add-drop-database --databases "${DB_NAME:-luminadb}" "${MEDIA_DB_NAME:-luminamedia}" \
    | gzip -c > "$file.tmp"
  gzip -t "$file.tmp"            # backup corrotto = errore, non un file vuoto spacciato per buono
  mv "$file.tmp" "$file"
  # Stesso proprietario della cartella sull'host (il container gira come root)
  chown --reference="$DIR" "$file" 2>/dev/null || true
  find "$DIR" -name 'lumina-*.sql.gz' -mtime +"$KEEP" -delete
  echo "[backup] completato ($(du -h "$file" | cut -f1)); conservati $(ls "$DIR"/lumina-*.sql.gz | wc -l) backup"
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
    echo "[backup] backup giornaliero alle ${HOUR}:00 (TZ=${TZ:-UTC}), conservazione ${KEEP} giorni"
    while true; do
      now=$(date +%s)
      next=$(date -d "today ${HOUR}:00" +%s)
      [ "$next" -le "$now" ] && next=$(date -d "tomorrow ${HOUR}:00" +%s)
      sleep $((next - now))
      run_backup || echo "[backup] ERRORE: backup non riuscito" >&2
    done
    ;;
  *)
    echo "Uso: backup.sh once|loop" >&2
    exit 2
    ;;
esac
