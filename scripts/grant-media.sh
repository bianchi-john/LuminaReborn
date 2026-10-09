#!/bin/bash
# Per installazioni create prima del database media: crea il database delle
# immagini e concede i permessi all'utente dell'applicazione, poi riavvia l'app.
set -euo pipefail
cd "$(dirname "$0")/.."
docker compose exec -T mysqldb bash -c '
  MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -u root <<SQL
CREATE DATABASE IF NOT EXISTS \`${MEDIA_DB_NAME:-luminamedia}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
GRANT ALL PRIVILEGES ON \`${MEDIA_DB_NAME:-luminamedia}\`.* TO "$MYSQL_USER"@"%";
FLUSH PRIVILEGES;
SQL'
docker compose restart nodeapp
echo "Database media pronto"
