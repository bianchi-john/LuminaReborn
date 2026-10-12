#!/bin/bash
# Per installazioni create prima dell'autenticazione su MongoDB: crea l'utente
# amministratore e quello dello user-manager (sfruttando l'eccezione localhost,
# valida finché non esistono utenti), poi riavvia lo user-manager.
set -euo pipefail
cd "$(dirname "$0")/.."
docker compose up -d mongo
sleep 3
docker compose exec -T mongo bash -c '
mongosh --quiet admin --eval "
  try {
    db.createUser({ user: process.env.MONGO_INITDB_ROOT_USERNAME, pwd: process.env.MONGO_INITDB_ROOT_PASSWORD, roles: [\"root\"] });
    print(\"Utente amministratore creato\");
  } catch (e) { print(\"Utente amministratore già presente: \" + e.message); }
"
mongosh --quiet -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin "${MONGO_APP_DB:-user_manager}" --eval "
  try {
    db.createUser({ user: process.env.MONGO_APP_USERNAME, pwd: process.env.MONGO_APP_PASSWORD, roles: [{ role: \"readWrite\", db: db.getName() }] });
    print(\"Utente dello user-manager creato\");
  } catch (e) { print(\"Utente dello user-manager già presente: \" + e.message); }
"'
docker compose restart user-manager-api
echo "Autenticazione MongoDB attiva"
