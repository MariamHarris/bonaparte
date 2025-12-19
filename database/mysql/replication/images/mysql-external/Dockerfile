FROM mysql:8.4

# Copiamos el cnf dentro de la imagen para evitar warnings de permisos
# cuando se monta desde Windows (world-writable -> MySQL ignora el archivo).
COPY primary.cnf /etc/mysql/conf.d/replication.cnf
RUN chmod 0644 /etc/mysql/conf.d/replication.cnf && chown root:root /etc/mysql/conf.d/replication.cnf
