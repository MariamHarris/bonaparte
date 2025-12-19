#!/usr/bin/env bash
set -euo pipefail

# Bootstrap del MySQL "externo" (primary)
# - Crea DB
# - Crea usuario de app (bonaparte) con password = MYSQL_ROOT_PASSWORD (mismo valor que MYSQL_PASSWORD en .env)
# - Crea usuario de replicación (repl) con password = MYSQL_REPL_PASSWORD

ROOT_PWD="${MYSQL_ROOT_PASSWORD:-yourpassword}"
REPL_PWD="${MYSQL_REPL_PASSWORD:-replpassword}"

mysql -uroot -p"${ROOT_PWD}" <<SQL
CREATE DATABASE IF NOT EXISTS bonaparte;

-- Usuario de la app (se replicará al interno)
CREATE USER IF NOT EXISTS 'bonaparte'@'%' IDENTIFIED BY '${ROOT_PWD}';
GRANT ALL PRIVILEGES ON bonaparte.* TO 'bonaparte'@'%';

-- Usuario de replicación (solo primary)
CREATE USER IF NOT EXISTS 'repl'@'%' IDENTIFIED BY '${REPL_PWD}';
GRANT REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'repl'@'%';

FLUSH PRIVILEGES;
SQL
