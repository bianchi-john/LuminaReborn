#!/bin/bash
# Eseguito da MySQL solo al primo avvio (cartella dati vuota), prima di init.sql.
# Crea il database separato per i file delle immagini e lo rende accessibile
# all'utente dell'applicazione.
set -euo pipefail
MEDIA_DB="${MEDIA_DB_NAME:-luminamedia}"
mysql --protocol=socket -uroot -p"${MYSQL_ROOT_PASSWORD}" <<SQL
CREATE DATABASE IF NOT EXISTS \`${MEDIA_DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
GRANT ALL PRIVILEGES ON \`${MEDIA_DB}\`.* TO '${MYSQL_USER}'@'%';
FLUSH PRIVILEGES;
SQL
echo "Database media '${MEDIA_DB}' pronto"
