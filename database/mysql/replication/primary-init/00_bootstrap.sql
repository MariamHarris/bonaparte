-- Bootstrap del MySQL "externo" (primary)

CREATE DATABASE IF NOT EXISTS bonaparte;

-- Usuario de la app (se replicará al interno)
CREATE USER IF NOT EXISTS 'bonaparte'@'%' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON bonaparte.* TO 'bonaparte'@'%';

-- Usuario de replicación (solo primary)
CREATE USER IF NOT EXISTS 'repl'@'%' IDENTIFIED BY 'replpassword';
GRANT REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'repl'@'%';

FLUSH PRIVILEGES;
