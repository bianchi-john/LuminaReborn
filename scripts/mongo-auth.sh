#!/bin/bash
# For installations created before MongoDB authentication: creates the
# administrator user and the user-manager one (using the localhost exception,
# valid until any user exists), then restarts the user-manager.
set -euo pipefail
cd "$(dirname "$0")/.."
docker compose up -d mongo
sleep 3
docker compose exec -T mongo bash -c '
mongosh --quiet admin --eval "
  try {
    db.createUser({ user: process.env.MONGO_INITDB_ROOT_USERNAME, pwd: process.env.MONGO_INITDB_ROOT_PASSWORD, roles: [\"root\"] });
    print(\"Administrator user created\");
  } catch (e) { print(\"Administrator user already exists: \" + e.message); }
"
mongosh --quiet -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin "${MONGO_APP_DB:-user_manager}" --eval "
  try {
    db.createUser({ user: process.env.MONGO_APP_USERNAME, pwd: process.env.MONGO_APP_PASSWORD, roles: [{ role: \"readWrite\", db: db.getName() }] });
    print(\"User-manager user created\");
  } catch (e) { print(\"User-manager user already exists: \" + e.message); }
"'
docker compose restart user-manager-api
echo "MongoDB authentication enabled"
