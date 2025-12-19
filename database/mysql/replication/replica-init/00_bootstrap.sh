#!/usr/bin/env bash
set -euo pipefail

# Bootstrap del MySQL "interno" (replica)
# - Crea DB si no existe
# - Crea usuario de la app para permitir conexiones de lectura desde el host
#   (independiente de si la replicación copia cuentas del schema mysql o no).

ROOT_PWD="${MYSQL_ROOT_PASSWORD:-yourpassword}"

mysql -uroot -p"${ROOT_PWD}" <<SQL
CREATE DATABASE IF NOT EXISTS bonaparte;

CREATE USER IF NOT EXISTS 'bonaparte'@'%' IDENTIFIED BY '${ROOT_PWD}';
GRANT ALL PRIVILEGES ON bonaparte.* TO 'bonaparte'@'%';

FLUSH PRIVILEGES;
SQL
