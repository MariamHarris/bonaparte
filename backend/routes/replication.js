const express = require('express');
const mysql = require('mysql2/promise');
const { requireConsultora } = require('../middleware/auth');

const router = express.Router();

function buildConnConfig({ host, port }) {
  return {
    host,
    port,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    charset: 'utf8mb4',
  };
}

function mapCompanyRow(r) {
  return {
    id: r.id,
    name: r.name,
    commercialName: r.commercial_name,
    legalName: r.legal_name,
    ruc: r.ruc,
    dv: r.dv,
    nit: r.nit,
    province: r.province,
    district: r.district,
    corregimiento: r.corregimiento,
    type: r.type,
    email: r.email,
    phone: r.phone,
    address: r.address,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : null,
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : null,
  };
}

function mapInteractionRow(r) {
  return {
    id: r.id,
    vacancyId: r.vacancy_id,
    companyId: r.company_id,
    channel: r.channel,
    event: r.event,
    intent: r.intent || null,
    userMessage: r.user_message || null,
    assistantMessage: r.assistant_message || null,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : null,
  };
}

async function fetchCompanies({ host, port, includeReplicationTests }) {
  const conn = await mysql.createConnection(buildConnConfig({ host, port }));
  try {
    const [rows] = await conn.query('SELECT * FROM companies ORDER BY created_at DESC');
    const mapped = (rows || []).map(mapCompanyRow);
    if (includeReplicationTests) return mapped;
    return mapped.filter((c) => !String(c.name || '').toLowerCase().startsWith('empresa replication'));
  } finally {
    await conn.end();
  }
}

async function fetchChatbotInteractions({ host, port, limit }) {
  const conn = await mysql.createConnection(buildConnConfig({ host, port }));
  try {
    const lim = Number.isFinite(limit) ? Number(limit) : 25;
    const safeLimit = Math.max(1, Math.min(200, lim));
    const [rows] = await conn.query(
      'SELECT id, vacancy_id, company_id, channel, event, intent, user_message, assistant_message, created_at FROM interactions WHERE channel = ? ORDER BY created_at DESC LIMIT ?',
      ['chatbot', safeLimit],
    );
    return (rows || []).map(mapInteractionRow);
  } finally {
    await conn.end();
  }
}

async function probeMySQL({ name, host, port, role }) {
  const result = {
    name,
    role,
    host,
    port,
    ok: false,
    info: null,
    replication: null,
    warning: null,
    replicationError: null,
    error: null,
  };

  try {
    const conn = await mysql.createConnection(buildConnConfig({ host, port }));
    const [[ping]] = await conn.query('SELECT 1 AS ok');

    const [[meta]] = await conn.query(
      "SELECT @@server_uuid AS serverUuid, @@server_id AS serverId, @@read_only AS readOnly, @@version AS version",
    );

    result.ok = Boolean(ping && ping.ok === 1);
    result.info = {
      serverUuid: meta && meta.serverUuid,
      serverId: meta && meta.serverId,
      readOnly: meta ? Boolean(meta.readOnly) : null,
      version: meta && meta.version,
    };

    if (role === 'replica') {
      try {
        // MySQL 8.0+ (SHOW SLAVE STATUS fue retirado en algunas versiones)
        const [rows] = await conn.query('SHOW REPLICA STATUS');
        const s = Array.isArray(rows) && rows[0] ? rows[0] : null;
        if (s) {
          const secondsBehind = s.Seconds_Behind_Source ?? s.Seconds_Behind_Master ?? null;
          const ioRunning = s.Replica_IO_Running ?? s.Slave_IO_Running ?? null;
          const sqlRunning = s.Replica_SQL_Running ?? s.Slave_SQL_Running ?? null;

          result.replication = {
            secondsBehind: secondsBehind === null || secondsBehind === undefined ? null : Number(secondsBehind),
            ioRunning: ioRunning ? String(ioRunning) : null,
            sqlRunning: sqlRunning ? String(sqlRunning) : null,
            sourceHost: s.Source_Host || s.Master_Host || null,
            lastError: s.Last_Error || s.Last_SQL_Error || null,
          };
        }
      } catch (e) {
        // Fallback: performance_schema (más estable entre versiones)
        try {
          const [[cs]] = await conn.query(
            'SELECT SERVICE_STATE, SOURCE_HOST, SOURCE_PORT, LAST_ERROR_MESSAGE FROM performance_schema.replication_connection_status LIMIT 1',
          );
          const [[as]] = await conn.query(
            'SELECT SERVICE_STATE, REMAINING_DELAY, LAST_ERROR_MESSAGE FROM performance_schema.replication_applier_status LIMIT 1',
          );

          result.replication = {
            secondsBehind:
              as && as.REMAINING_DELAY !== null && as.REMAINING_DELAY !== undefined
                ? Number(as.REMAINING_DELAY)
                : null,
            ioRunning: cs && cs.SERVICE_STATE ? String(cs.SERVICE_STATE) : null,
            sqlRunning: as && as.SERVICE_STATE ? String(as.SERVICE_STATE) : null,
            sourceHost: cs && cs.SOURCE_HOST ? String(cs.SOURCE_HOST) : null,
            lastError: (as && as.LAST_ERROR_MESSAGE) || (cs && cs.LAST_ERROR_MESSAGE) || null,
          };
        } catch (e2) {
          const msg = (e2 && e2.message) || (e && e.message) || String(e2 || e);
          result.replicationError = msg;
          result.warning = 'Conexión OK, pero sin permisos para leer el estado de replicación.';
        }
      }
    }

    await conn.end();
    return result;
  } catch (err) {
    result.error = err && err.message ? err.message : String(err);
    return result;
  }
}

// Estado de replicación (externa/interna). Solo consultora.
router.get('/status', requireConsultora, async (req, res) => {
  const externalHost = process.env.MYSQL_HOST || '127.0.0.1';
  const externalPort = process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3307;

  const internalHost = process.env.MYSQL_REPLICA_HOST || externalHost;
  const internalPort = process.env.MYSQL_REPLICA_PORT ? Number(process.env.MYSQL_REPLICA_PORT) : 3308;

  const proxyHost = process.env.MYSQL_PROXY_HOST || '127.0.0.1';
  const proxyWritePort = process.env.MYSQL_PROXY_WRITE_PORT ? Number(process.env.MYSQL_PROXY_WRITE_PORT) : 6033;
  const proxyReadPort = process.env.MYSQL_PROXY_READ_PORT ? Number(process.env.MYSQL_PROXY_READ_PORT) : 6034;

  const [external, internal, proxyWrite, proxyRead] = await Promise.all([
    probeMySQL({ name: 'Externa (Primary)', host: externalHost, port: externalPort, role: 'primary' }),
    probeMySQL({ name: 'Interna (Replica)', host: internalHost, port: internalPort, role: 'replica' }),
    probeMySQL({ name: 'Proxy Write (6033)', host: proxyHost, port: proxyWritePort, role: 'primary' }),
    probeMySQL({ name: 'Proxy Read (6034)', host: proxyHost, port: proxyReadPort, role: 'primary' }),
  ]);

  res.json({
    ok: true,
    generatedAt: new Date().toISOString(),
    targets: { external, internal, proxyWrite, proxyRead },
  });
});

// Lista de empresas en primary (externa) y replica (interna), estilo "gestor".
router.get('/companies', requireConsultora, async (req, res) => {
  const includeReplicationTests = String(req.query.includeReplicationTests || '').toLowerCase() === 'true';

  const externalHost = process.env.MYSQL_HOST || '127.0.0.1';
  const externalPort = process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3307;

  const internalHost = process.env.MYSQL_REPLICA_HOST || externalHost;
  const internalPort = process.env.MYSQL_REPLICA_PORT ? Number(process.env.MYSQL_REPLICA_PORT) : 3308;

  const [external, internal] = await Promise.all([
    fetchCompanies({ host: externalHost, port: externalPort, includeReplicationTests }),
    fetchCompanies({ host: internalHost, port: internalPort, includeReplicationTests }),
  ]);

  res.json({
    ok: true,
    generatedAt: new Date().toISOString(),
    external: { host: externalHost, port: externalPort, companies: external },
    internal: { host: internalHost, port: internalPort, companies: internal },
  });
});

// Replicación específica del chatbot: compara las últimas interacciones (channel=chatbot)
// entre primary (externa) y replica (interna). Solo consultora.
router.get('/chatbot', requireConsultora, async (req, res) => {
  const externalHost = process.env.MYSQL_HOST || '127.0.0.1';
  const externalPort = process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3307;

  const internalHost = process.env.MYSQL_REPLICA_HOST || externalHost;
  const internalPort = process.env.MYSQL_REPLICA_PORT ? Number(process.env.MYSQL_REPLICA_PORT) : 3308;

  const limit = Number(req.query.limit || 25);

  const [external, internal] = await Promise.all([
    fetchChatbotInteractions({ host: externalHost, port: externalPort, limit }),
    fetchChatbotInteractions({ host: internalHost, port: internalPort, limit }),
  ]);

  res.json({
    ok: true,
    generatedAt: new Date().toISOString(),
    external: { host: externalHost, port: externalPort, interactions: external },
    internal: { host: internalHost, port: internalPort, interactions: internal },
  });
});

module.exports = router;
