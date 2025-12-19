const express = require('express');
const { randomUUID } = require('crypto');
const bcrypt = require('bcryptjs');
const { getMySQLPool } = require('../db');
const { signAccessToken } = require('../services/jwt');

const router = express.Router();

function requirePool(res) {
  const pool = getMySQLPool();
  if (!pool) {
    res.status(503).json({ error: 'MySQL no disponible' });
    return null;
  }
  return pool;
}

router.post('/register/consultora', async (req, res, next) => {
  try {
    const pool = requirePool(res);
    if (!pool) return;

    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username y password son requeridos' });

    const id = randomUUID();
    const passwordHash = await bcrypt.hash(String(password), 10);

    await pool.query(
      'INSERT INTO users (id, username, password_hash, role, company_id) VALUES (?, ?, ?, ?, NULL)',
      [id, String(username), passwordHash, 'consultora'],
    );

    const token = signAccessToken({ sub: id, role: 'consultora' });
    res.status(201).json({ ok: true, user: { id, username, role: 'consultora' }, token });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'username ya existe' });
    }
    next(err);
  }
});

router.post('/register/company', async (req, res, next) => {
  try {
    const pool = requirePool(res);
    if (!pool) return;

    const { username, password, company } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username y password son requeridos' });
    if (!company || !company.name) return res.status(400).json({ error: 'company.name es requerido' });

    const companyId = randomUUID();
    const userId = randomUUID();

    await pool.query(
      'INSERT INTO companies (id, name, type, email, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
      [
        companyId,
        String(company.name),
        company.type === 'public' ? 'public' : 'private',
        company.email || null,
        company.phone || null,
        company.address || null,
      ],
    );

    const tollDescription =
      'El costo del peaje se calculará por interacción (accesos a vacantes). La facturación será gestionada por la Empresa Consultora.';

    await pool.query(
      'INSERT INTO company_contracts (company_id, accepted, accepted_at, toll_description) VALUES (?, 0, NULL, ?)',
      [companyId, tollDescription],
    );

    const passwordHash = await bcrypt.hash(String(password), 10);
    await pool.query(
      'INSERT INTO users (id, username, password_hash, role, company_id) VALUES (?, ?, ?, ?, ?)',
      [userId, String(username), passwordHash, 'empresa', companyId],
    );

    const token = signAccessToken({ sub: userId, role: 'empresa', companyId });
    res.status(201).json({
      ok: true,
      company: {
        id: companyId,
        name: company.name,
        type: company.type === 'public' ? 'public' : 'private',
        email: company.email || null,
        phone: company.phone || null,
        address: company.address || null,
      },
      contract: { accepted: false, tollDescription },
      user: { id: userId, username, role: 'empresa', companyId },
      token,
    });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'username ya existe' });
    }
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const pool = requirePool(res);
    if (!pool) return;

    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username y password son requeridos' });

    const [rows] = await pool.query(
      'SELECT id, username, password_hash, role, company_id FROM users WHERE username = ? LIMIT 1',
      [String(username)],
    );

    const user = Array.isArray(rows) && rows[0];
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const ok = await bcrypt.compare(String(password), user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = signAccessToken({ sub: user.id, role: user.role, companyId: user.company_id || null });
    res.json({ ok: true, role: user.role, token });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
