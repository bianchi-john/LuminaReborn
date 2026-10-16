#!/bin/sh
# Automatic update from GitHub: run by cron on the server (every 2 minutes).
#
# If the tracked branch has a new commit, it rebuilds the app image while the
# site keeps running, restarts the containers (a few seconds of downtime) and
# checks /healthz. If the new version does not answer, it goes back to the
# previous one. .env, backups/ and the Docker volumes are never touched.
# Database migrations are not undone by a rollback: they only add (see docs).
#
# Install:  crontab -e  ->  */2 * * * * /path/to/LuminaReborn/scripts/aggiorna.sh
# Log:      backups/aggiornamenti.log

set -eu
PATH="/snap/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
cd "$(dirname "$0")/.."

BRANCH="${AGGIORNA_BRANCH:-$(git rev-parse --abbrev-ref HEAD)}"
ATTIVA_FILE=".versione-attiva"
LOG="backups/aggiornamenti.log"
mkdir -p backups

log() { echo "$(date -Is) $*" >> "$LOG"; }

# One run at a time (a build can take longer than the cron interval)
exec 9>/tmp/lumina-aggiorna.lock
flock -n 9 || exit 0

git fetch --quiet origin "$BRANCH" || { log "fetch failed (network?)"; exit 0; }
NUOVA=$(git rev-parse "origin/$BRANCH")
ATTIVA=$(cat "$ATTIVA_FILE" 2>/dev/null || echo none)
[ "$NUOVA" = "$ATTIVA" ] && exit 0
# A commit that already failed is not retried: the next push will be
[ "$NUOVA" = "$(cat "$ATTIVA_FILE.scartata" 2>/dev/null)" ] && exit 0

PORTA=$(sed -n 's/^APP_PORT=//p' .env 2>/dev/null | tail -1)
sana() {
  i=0
  until curl -sf -o /dev/null "http://127.0.0.1:${PORTA:-3000}/healthz"; do
    i=$((i + 1))
    [ "$i" -ge 60 ] && return 1
    sleep 3
  done
}

avvia() {
  git reset --quiet --hard "$1"
  chmod +x scripts/*.sh
  # Build first, while the current version is still serving; then swap the containers
  docker compose build --quiet nodeapp >> "$LOG" 2>&1 && docker compose up -d --remove-orphans >> "$LOG" 2>&1 && sana
}

log "update ${ATTIVA} -> ${NUOVA} ($(git log -1 --format=%s "$NUOVA"))"
if avvia "$NUOVA"; then
  echo "$NUOVA" > "$ATTIVA_FILE"
  log "ok: $(git log -1 --format='%h %s' "$NUOVA")"
elif [ "$ATTIVA" != none ]; then
  log "the new version does not answer: back to ${ATTIVA}"
  if avvia "$ATTIVA"; then log "rollback ok"; else log "ROLLBACK FAILED: check with 'docker compose logs nodeapp'"; fi
  # Don't try the broken commit again on every run: wait for a newer one
  echo "$NUOVA" > "$ATTIVA_FILE.scartata"
else
  log "the new version does not answer and there is no previous one to go back to"
fi
