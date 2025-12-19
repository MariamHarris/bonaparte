const { randomUUID } = require('crypto');
const { getMySQLPool } = require('../db');

function requirePool() {
  const pool = getMySQLPool();
  if (!pool) {
    const err = new Error('MySQL no disponible');
    err.statusCode = 503;
    throw err;
  }
  return pool;
}

async function listCompanies() {
  const pool = requirePool();
  const [rows] = await pool.query('SELECT * FROM companies ORDER BY created_at DESC');
  return rows.map(mapCompanyRow);
}

async function getCompanyById(id) {
  const pool = requirePool();
  const [rows] = await pool.query('SELECT * FROM companies WHERE id = ? LIMIT 1', [id]);
  return rows[0] ? mapCompanyRow(rows[0]) : null;
}

async function createCompany(data) {
  const pool = requirePool();
  const id = randomUUID();
  await pool.query(
    `
      INSERT INTO companies (
        id, name, commercial_name, legal_name, ruc, dv, nit,
        province, district, corregimiento,
        type, email, phone, address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      data.name,
      data.commercialName || data.name || null,
      data.legalName || data.name || null,
      data.ruc || null,
      data.dv || null,
      data.nit || null,
      data.province || null,
      data.district || null,
      data.corregimiento || null,
      data.type === 'public' ? 'public' : 'private',
      data.email || null,
      data.phone || null,
      data.address || null,
    ],
  );
  return getCompanyById(id);
}

async function updateCompany(id, patch) {
  const pool = requirePool();
  const current = await getCompanyById(id);
  if (!current) return null;

  const next = {
    ...current,
    ...patch,
    type: patch.type ? (patch.type === 'public' ? 'public' : 'private') : current.type,
  };

  await pool.query(
    `
      UPDATE companies
        SET name=?, commercial_name=?, legal_name=?, ruc=?, dv=?, nit=?,
            province=?, district=?, corregimiento=?,
            type=?, email=?, phone=?, address=?
      WHERE id=?
    `,
    [
      next.name,
      next.commercialName || next.name || null,
      next.legalName || next.name || null,
      next.ruc || null,
      next.dv || null,
      next.nit || null,
      next.province || null,
      next.district || null,
      next.corregimiento || null,
      next.type,
      next.email || null,
      next.phone || null,
      next.address || null,
      id,
    ],
  );

  return getCompanyById(id);
}

async function deleteCompany(id) {
  const pool = requirePool();
  const [res] = await pool.query('DELETE FROM companies WHERE id=?', [id]);
  return res.affectedRows > 0;
}

async function getContract(companyId) {
  const pool = requirePool();
  const [rows] = await pool.query(
    'SELECT company_id, accepted, accepted_at, toll_description, created_at FROM company_contracts WHERE company_id=? LIMIT 1',
    [companyId],
  );
  if (!rows[0]) return null;
  return {
    companyId: rows[0].company_id,
    accepted: Boolean(rows[0].accepted),
    acceptedAt: rows[0].accepted_at ? new Date(rows[0].accepted_at).toISOString() : null,
    tollDescription: rows[0].toll_description,
    tollUsdPerInteraction: rows[0].toll_usd_per_interaction ? Number(rows[0].toll_usd_per_interaction) : null,
    interactionDefinition: rows[0].interaction_definition || null,
    billingTerms: rows[0].billing_terms || null,
    contractHtml: rows[0].contract_html || null,
    contractJson: (() => {
      const raw = rows[0].contract_json;
      if (!raw) return null;
      if (typeof raw === 'string') {
        try {
          return JSON.parse(raw);
        } catch (_err) {
          return null;
        }
      }
      return raw;
    })(),
    contractVersion: rows[0].contract_version || null,
    createdAt: rows[0].created_at ? new Date(rows[0].created_at).toISOString() : null,
  };
}

async function acceptContract(companyId) {
  const pool = requirePool();
  await pool.query(
    'UPDATE company_contracts SET accepted=1, accepted_at=NOW() WHERE company_id=?',
    [companyId],
  );
  return getContract(companyId);
}

async function listVacancies({ companyId } = {}) {
  const pool = requirePool();
  const [rows] = companyId
    ? await pool.query('SELECT * FROM vacancies WHERE company_id=? ORDER BY created_at DESC', [companyId])
    : await pool.query('SELECT * FROM vacancies ORDER BY created_at DESC');
  return rows.map(mapVacancyRow);
}

async function getVacancyById(id) {
  const pool = requirePool();
  const [rows] = await pool.query('SELECT * FROM vacancies WHERE id=? LIMIT 1', [id]);
  return rows[0] ? mapVacancyRow(rows[0]) : null;
}

async function createVacancy(data) {
  const pool = requirePool();
  const id = randomUUID();
  await pool.query(
    'INSERT INTO vacancies (id, company_id, title, description, location, salary, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      id,
      data.companyId,
      data.title,
      data.description || null,
      data.location || null,
      data.salary || null,
      data.status === 'closed' ? 'closed' : 'open',
    ],
  );
  return getVacancyById(id);
}

async function updateVacancy(id, patch) {
  const pool = requirePool();
  const current = await getVacancyById(id);
  if (!current) return null;

  const next = {
    ...current,
    ...patch,
    status: patch.status ? (patch.status === 'closed' ? 'closed' : 'open') : current.status,
  };

  await pool.query(
    'UPDATE vacancies SET title=?, description=?, location=?, salary=?, status=? WHERE id=?',
    [
      next.title,
      next.description || null,
      next.location || null,
      next.salary || null,
      next.status,
      id,
    ],
  );

  return getVacancyById(id);
}

async function deleteVacancy(id) {
  const pool = requirePool();
  const [res] = await pool.query('DELETE FROM vacancies WHERE id=?', [id]);
  return res.affectedRows > 0;
}

async function resolveCompanyIdForVacancy(vacancyId, providedCompanyId) {
  if (providedCompanyId) return providedCompanyId;
  const pool = requirePool();
  const [rows] = await pool.query('SELECT company_id FROM vacancies WHERE id=? LIMIT 1', [vacancyId]);
  return rows[0] ? rows[0].company_id : null;
}

async function recordInteraction({ vacancyId, companyId, channel = 'web', event = 'view', intent = null }) {
  const pool = requirePool();
  const id = randomUUID();
  const resolvedCompanyId = await resolveCompanyIdForVacancy(vacancyId, companyId);
  await pool.query(
    'INSERT INTO interactions (id, vacancy_id, company_id, channel, event, intent) VALUES (?, ?, ?, ?, ?, ?)',
    [id, vacancyId, resolvedCompanyId, channel, event, intent],
  );
  return { id, vacancyId, companyId: resolvedCompanyId, channel, event, intent };
}

async function listInteractions({ vacancyId } = {}) {
  const pool = requirePool();
  const [rows] = vacancyId
    ? await pool.query('SELECT * FROM interactions WHERE vacancy_id=? ORDER BY created_at DESC', [vacancyId])
    : await pool.query('SELECT * FROM interactions ORDER BY created_at DESC');

  return rows.map((r) => ({
    id: r.id,
    vacancyId: r.vacancy_id,
    companyId: r.company_id,
    channel: r.channel,
    event: r.event,
    intent: r.intent || null,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : null,
  }));
}

async function countInteractionsForCompany({ companyId, start, end }) {
  const pool = requirePool();
  const [rows] = await pool.query(
    `
      SELECT COUNT(*) AS cnt
      FROM interactions i
      LEFT JOIN vacancies v ON v.id = i.vacancy_id
      WHERE (i.company_id = ? OR (i.company_id IS NULL AND v.company_id = ?))
        AND i.created_at >= ?
        AND i.created_at <= ?
    `,
    [companyId, companyId, start, end],
  );
  return Number(rows[0].cnt || 0);
}

async function createInvoice(data) {
  const pool = requirePool();
  const id = randomUUID();
  const subtotal = data.subtotal ?? Number((data.interactionsCount * data.tollPerInteraction).toFixed(2));
  const itbmsRate = data.itbmsRate ?? 7.0;
  const itbmsAmount = data.itbmsAmount ?? Number((subtotal * (itbmsRate / 100)).toFixed(2));
  const grandTotal = data.grandTotal ?? Number((subtotal + itbmsAmount).toFixed(2));
  const total = data.total ?? grandTotal;
  const fiscalNumber = data.fiscalNumber || null;
  await pool.query(
    `
      INSERT INTO invoices (
        id, company_id, period_start, period_end, interactions_count, toll_per_interaction,
        subtotal, itbms_rate, itbms_amount, total, grand_total, fiscal_number, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      data.companyId,
      data.periodStart,
      data.periodEnd,
      data.interactionsCount,
      data.tollPerInteraction,
      subtotal,
      itbmsRate,
      itbmsAmount,
      total,
      grandTotal,
      fiscalNumber,
      data.status || 'issued',
    ],
  );

  return getInvoiceById(id);
}

async function listInvoices() {
  const pool = requirePool();
  const [rows] = await pool.query('SELECT * FROM invoices ORDER BY created_at DESC');
  return rows.map(mapInvoiceRow);
}

async function listInvoicesByCompany(companyId) {
  const pool = requirePool();
  const [rows] = await pool.query(
    'SELECT * FROM invoices WHERE company_id=? ORDER BY created_at DESC',
    [companyId],
  );
  return rows.map(mapInvoiceRow);
}

async function getInvoiceById(id) {
  const pool = requirePool();
  const [rows] = await pool.query('SELECT * FROM invoices WHERE id=? LIMIT 1', [id]);
  return rows[0] ? mapInvoiceRow(rows[0]) : null;
}

async function upsertInvoiceFile({ invoiceId, relativePath }) {
  const pool = requirePool();
  await pool.query(
    'INSERT INTO invoice_files (invoice_id, relative_path) VALUES (?, ?) ON DUPLICATE KEY UPDATE relative_path=VALUES(relative_path)',
    [invoiceId, relativePath],
  );
  return getInvoiceFile(invoiceId);
}

async function getInvoiceFile(invoiceId) {
  const pool = requirePool();
  const [rows] = await pool.query('SELECT invoice_id, relative_path FROM invoice_files WHERE invoice_id=? LIMIT 1', [invoiceId]);
  return rows[0]
    ? { invoiceId: rows[0].invoice_id, relativePath: rows[0].relative_path }
    : null;
}

async function getCompanyInteractionStats({ companyId, start, end }) {
  const pool = requirePool();

  const [totalRows] = await pool.query(
    `
      SELECT COUNT(*) AS cnt
      FROM interactions i
      LEFT JOIN vacancies v ON v.id = i.vacancy_id
      WHERE (i.company_id = ? OR (i.company_id IS NULL AND v.company_id = ?))
        AND i.created_at >= ?
        AND i.created_at <= ?
    `,
    [companyId, companyId, start, end],
  );

  const [byChannelRows] = await pool.query(
    `
      SELECT i.channel, COUNT(*) AS cnt
      FROM interactions i
      LEFT JOIN vacancies v ON v.id = i.vacancy_id
      WHERE (i.company_id = ? OR (i.company_id IS NULL AND v.company_id = ?))
        AND i.created_at >= ?
        AND i.created_at <= ?
      GROUP BY i.channel
      ORDER BY cnt DESC
    `,
    [companyId, companyId, start, end],
  );

  const [byEventRows] = await pool.query(
    `
      SELECT i.event, COUNT(*) AS cnt
      FROM interactions i
      LEFT JOIN vacancies v ON v.id = i.vacancy_id
      WHERE (i.company_id = ? OR (i.company_id IS NULL AND v.company_id = ?))
        AND i.created_at >= ?
        AND i.created_at <= ?
      GROUP BY i.event
      ORDER BY cnt DESC
    `,
    [companyId, companyId, start, end],
  );

  const [byIntentRows] = await pool.query(
    `
      SELECT i.intent, COUNT(*) AS cnt
      FROM interactions i
      LEFT JOIN vacancies v ON v.id = i.vacancy_id
      WHERE (i.company_id = ? OR (i.company_id IS NULL AND v.company_id = ?))
        AND i.created_at >= ?
        AND i.created_at <= ?
        AND i.intent IS NOT NULL
      GROUP BY i.intent
      ORDER BY cnt DESC
      LIMIT 10
    `,
    [companyId, companyId, start, end],
  );

  const [dailyRows] = await pool.query(
    `
      SELECT DATE(i.created_at) AS day, COUNT(*) AS cnt
      FROM interactions i
      LEFT JOIN vacancies v ON v.id = i.vacancy_id
      WHERE (i.company_id = ? OR (i.company_id IS NULL AND v.company_id = ?))
        AND i.created_at >= ?
        AND i.created_at <= ?
      GROUP BY DATE(i.created_at)
      ORDER BY day ASC
    `,
    [companyId, companyId, start, end],
  );

  const [topVacanciesRows] = await pool.query(
    `
      SELECT v.id AS vacancy_id, v.title, COUNT(*) AS cnt
      FROM interactions i
      JOIN vacancies v ON v.id = i.vacancy_id
      WHERE (i.company_id = ? OR (i.company_id IS NULL AND v.company_id = ?))
        AND i.created_at >= ?
        AND i.created_at <= ?
      GROUP BY v.id, v.title
      ORDER BY cnt DESC
      LIMIT 10
    `,
    [companyId, companyId, start, end],
  );

  return {
    total: Number(totalRows[0].cnt || 0),
    byChannel: byChannelRows.map((r) => ({ channel: r.channel, count: Number(r.cnt) })),
    byEvent: byEventRows.map((r) => ({ event: r.event, count: Number(r.cnt) })),
    daily: dailyRows.map((r) => ({ day: String(r.day), count: Number(r.cnt) })),
    topVacancies: topVacanciesRows.map((r) => ({ id: r.vacancy_id, title: r.title, count: Number(r.cnt) })),
    byIntent: byIntentRows.map((r) => ({ intent: r.intent, count: Number(r.cnt) })),
  };
}

async function getVacancyInteractionStats({ vacancyId, start, end }) {
  const pool = requirePool();

  const [totalRows] = await pool.query(
    `
      SELECT COUNT(*) AS cnt
      FROM interactions
      WHERE vacancy_id = ?
        AND created_at >= ?
        AND created_at <= ?
    `,
    [vacancyId, start, end],
  );

  const [byChannelRows] = await pool.query(
    `
      SELECT channel, COUNT(*) AS cnt
      FROM interactions
      WHERE vacancy_id = ?
        AND created_at >= ?
        AND created_at <= ?
      GROUP BY channel
      ORDER BY cnt DESC
    `,
    [vacancyId, start, end],
  );

  const [byEventRows] = await pool.query(
    `
      SELECT event, COUNT(*) AS cnt
      FROM interactions
      WHERE vacancy_id = ?
        AND created_at >= ?
        AND created_at <= ?
      GROUP BY event
      ORDER BY cnt DESC
    `,
    [vacancyId, start, end],
  );

  const [byIntentRows] = await pool.query(
    `
      SELECT intent, COUNT(*) AS cnt
      FROM interactions
      WHERE vacancy_id = ?
        AND created_at >= ?
        AND created_at <= ?
        AND intent IS NOT NULL
      GROUP BY intent
      ORDER BY cnt DESC
      LIMIT 10
    `,
    [vacancyId, start, end],
  );

  const [dailyRows] = await pool.query(
    `
      SELECT DATE(created_at) AS day, COUNT(*) AS cnt
      FROM interactions
      WHERE vacancy_id = ?
        AND created_at >= ?
        AND created_at <= ?
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    `,
    [vacancyId, start, end],
  );

  return {
    total: Number(totalRows[0].cnt || 0),
    byChannel: byChannelRows.map((r) => ({ channel: r.channel, count: Number(r.cnt) })),
    byEvent: byEventRows.map((r) => ({ event: r.event, count: Number(r.cnt) })),
    daily: dailyRows.map((r) => ({ day: String(r.day), count: Number(r.cnt) })),
    byIntent: byIntentRows.map((r) => ({ intent: r.intent, count: Number(r.cnt) })),
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

function mapVacancyRow(r) {
  return {
    id: r.id,
    companyId: r.company_id,
    title: r.title,
    description: r.description,
    location: r.location,
    salary: r.salary,
    status: r.status,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : null,
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : null,
  };
}

function mapInvoiceRow(r) {
  return {
    id: r.id,
    companyId: r.company_id,
    periodStart: r.period_start ? new Date(r.period_start).toISOString() : null,
    periodEnd: r.period_end ? new Date(r.period_end).toISOString() : null,
    interactionsCount: r.interactions_count,
    tollPerInteraction: Number(r.toll_per_interaction),
    subtotal: Number(r.subtotal ?? r.total ?? 0),
    itbmsRate: Number(r.itbms_rate ?? 7),
    itbmsAmount: Number(r.itbms_amount ?? 0),
    total: Number(r.total),
    grandTotal: Number(r.grand_total ?? r.total ?? 0),
    fiscalNumber: r.fiscal_number || null,
    status: r.status,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : null,
  };
}

module.exports = {
  listCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getContract,
  acceptContract,
  listVacancies,
  getVacancyById,
  createVacancy,
  updateVacancy,
  deleteVacancy,
  recordInteraction,
  listInteractions,
  countInteractionsForCompany,
  createInvoice,
  listInvoices,
  listInvoicesByCompany,
  getInvoiceById,
  upsertInvoiceFile,
  getInvoiceFile,
  getCompanyInteractionStats,
  getVacancyInteractionStats,
};
