#!/bin/sh
# Crea gli utenti dimostrativi nello user-manager (MongoDB).
#
# Lo user-manager crea da solo il solo utente amministratore (ADMIN_USERNAME /
# ADMIN_PASSWORD). Questo script, eseguito al primo avvio dal servizio
# "user-seed" di docker-compose, aggiunge gli schedatori dimostrativi in modo
# idempotente: se un utente esiste gia' l'errore viene ignorato.
#
# Gli username coincidono con gli autori gia' presenti nelle 6 schede
# dimostrative, cosi' che accedendo come schedatore si vedano subito le proprie
# bozze una volta create.

set -eu

API="${USER_MANAGER_API_URL:-http://user-manager-api}"
ADMIN_USERNAME="${ADMIN_USERNAME:-admin}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin}"

# Schedatori dimostrativi: "username:password". La password, solo per la demo,
# e' comune a tutti e vale "schedatore" (lo user-manager richiede almeno 6
# caratteri, quindi non si puo' usare uno username breve come password).
SCHEDATORI="pasquale:schedatore elena:schedatore virginia:schedatore"

echo "[seed] Attendo che l'API dello user-manager sia pronta su ${API} ..."
i=0
until curl -sf -o /dev/null "${API}/"; do
  i=$((i + 1))
  if [ "$i" -ge 60 ]; then
    echo "[seed] API non raggiungibile dopo 60 tentativi, esco."
    exit 1
  fi
  sleep 2
done

echo "[seed] Login come amministratore '${ADMIN_USERNAME}' ..."
JWT=$(curl -s -X POST "${API}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${ADMIN_USERNAME}\",\"password\":\"${ADMIN_PASSWORD}\"}" \
  | sed -n 's/.*"jwt"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')

if [ -z "${JWT}" ]; then
  echo "[seed] Impossibile ottenere il token amministratore, esco."
  exit 1
fi

for entry in $SCHEDATORI; do
  user="${entry%%:*}"
  pass="${entry#*:}"
  echo "[seed] Creo lo schedatore '${user}' (ignoro se esiste gia') ..."
  resp=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${API}/users" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${JWT}" \
    -d "{\"username\":\"${user}\",\"password\":\"${pass}\"}")
  echo "[seed]   -> HTTP ${resp}"
done

echo "[seed] Completato."
