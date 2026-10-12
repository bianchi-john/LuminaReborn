#!/bin/sh
# Creates the demo users in the user-manager (MongoDB).
#
# The user-manager creates only the administrator user on its own (ADMIN_USERNAME /
# ADMIN_PASSWORD). This script, run on first start by the docker-compose
# "user-seed" service, adds the demo cataloguers idempotently:
# if a user already exists the error is ignored.
#
# The usernames match the authors already present in the 6 demo records,
# so that logging in as a cataloguer immediately shows your own drafts
# once created.

set -eu

API="${USER_MANAGER_API_URL:-http://user-manager-api}"
ADMIN_USERNAME="${ADMIN_USERNAME:-admin}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin}"

# Demo cataloguers: "username:password". The password, for the demo only,
# is shared by all and is "schedatore" (the user-manager requires at least 6
# characters, so a short username can't be used as the password).
SCHEDATORI="pasquale:schedatore elena:schedatore virginia:schedatore"

echo "[seed] Waiting for the user-manager API to be ready at ${API} ..."
i=0
until curl -sf -o /dev/null "${API}/"; do
  i=$((i + 1))
  if [ "$i" -ge 60 ]; then
    echo "[seed] API unreachable after 60 attempts, exiting."
    exit 1
  fi
  sleep 2
done

echo "[seed] Logging in as administrator '${ADMIN_USERNAME}' ..."
JWT=$(curl -s -X POST "${API}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${ADMIN_USERNAME}\",\"password\":\"${ADMIN_PASSWORD}\"}" \
  | sed -n 's/.*"jwt"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')

if [ -z "${JWT}" ]; then
  echo "[seed] Could not obtain the administrator token, exiting."
  exit 1
fi

for entry in $SCHEDATORI; do
  user="${entry%%:*}"
  pass="${entry#*:}"
  echo "[seed] Creating cataloguer '${user}' (ignored if it already exists) ..."
  resp=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${API}/users" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${JWT}" \
    -d "{\"username\":\"${user}\",\"password\":\"${pass}\"}")
  echo "[seed]   -> HTTP ${resp}"
done

echo "[seed] Done."
