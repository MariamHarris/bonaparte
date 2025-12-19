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
    'INSERT INTO companies (id, name, type, email, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
    [
      id,
      data.name,
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
    'UPDATE companies SET name=?, type=?, email=?, phone=?, address=? WHERE id=?',
    [next.name, next.type, next.email || null, next.phone || null, next.address || null, id],
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

async function recordInteraction({ vacancyId, channel = 'web', event = 'view' }) {
  const pool = requirePool();
  const id = randomUUID();
  await pool.query(
    'INSERT INTO interactions (id, vacancy_id, channel, event) VALUES (?, ?, ?, ?)',
    [id, vacancyId, channel, event],
  );
  return { id, vacancyId, channel, event };
}

async function listInteractions({ vacancyId } = {}) {
  const pool = requirePool();
  const [rows] = vacancyId
    ? await pool.query('SELECT * FROM interactions WHERE vacancy_id=? ORDER BY created_at DESC', [vacancyId])
    : await pool.query('SELECT * FROM interactions ORDER BY created_at DESC');

  return rows.map((r) => ({
    id: r.id,
    vacancyId: r.vacancy_id,
    channel: r.channel,
    event: r.event,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : null,
  }));
}

async function countInteractionsForCompany({ companyId, start, end }) {
  const pool = requirePool();
  const [rows] = await pool.query(
    `
      SELECT COUNT(*) AS cnt
      FROM interactions i
      JOIN vacancies v ON v.id = i.vacancy_id
      WHERE v.company_id = ?
        AND i.created_at >= ?
        AND i.created_at <= ?
    `,
    [companyId, start, end],
  );
  return Number(rows[0].cnt || 0);
}

async function createInvoice(data) {
  const pool = requirePool();
  const id = randomUUID();
  await pool.query(
    `
      INSERT INTO invoices (
        id, company_id, period_start, period_end, interactions_count, toll_per_interaction, total, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      data.companyId,
      data.periodStart,
      data.periodEnd,
      data.interactionsCount,
      data.tollPerInteraction,
      data.total,
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

function mapCompanyRow(r) {
  return {
    id: r.id,
    name: r.name,
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
    total: Number(r.total),
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
  getInvoiceById,
  upsertInvoiceFile,
  getInvoiceFile,
};
