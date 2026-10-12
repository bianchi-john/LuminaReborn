#!/bin/bash
# Run by MySQL only on first start (empty data directory), before init.sql.
# Creates the separate database for image files and makes it accessible
# to the application user.
set -euo pipefail
MEDIA_DB="${MEDIA_DB_NAME:-luminamedia}"
mysql --protocol=socket -uroot -p"${MYSQL_ROOT_PASSWORD}" <<SQL
CREATE DATABASE IF NOT EXISTS \`${MEDIA_DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
GRANT ALL PRIVILEGES ON \`${MEDIA_DB}\`.* TO '${MYSQL_USER}'@'%';
FLUSH PRIVILEGES;
SQL
echo "Media database '${MEDIA_DB}' ready"
