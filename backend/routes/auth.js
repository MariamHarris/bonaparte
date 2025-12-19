const express = require('express');
const { randomUUID } = require('crypto');
const bcrypt = require('bcryptjs');
const { getMySQLPool } = require('../db');
const { signAccessToken } = require('../services/jwt');
const { createCompany } = require('../storage/mysql-repo');

const router = express.Router();

function requirePool(res) {
  const pool = getMySQLPool();
  if (!pool) {
    res.status(503).json({ error: 'MySQL no disponible' });
    return null;
  }
  return pool;
}

const DEFAULT_TOLL_USD = 0.25;

function normalizeCompanyPayload(raw = {}) {
  const fallbackName = raw.name || raw.commercialName || raw.legalName || 'Empresa Panamá';
  const commercialName = raw.commercialName || fallbackName;
  const legalName = raw.legalName || `${commercialName} S.A.`;
  return {
    name: fallbackName,
    commercialName,
    legalName,
    ruc: raw.ruc || '155-789-456',
    dv: raw.dv || '82',
    nit: raw.nit || '8-NT-001234',
    province: raw.province || 'Panamá',
    district: raw.district || 'Panamá',
    corregimiento: raw.corregimiento || 'San Francisco',
    type: raw.type === 'public' ? 'public' : 'private',
    email: raw.email || null,
    phone: raw.phone || null,
    address: raw.address || `${legalName}, ${raw.district || 'Panamá'}, ${raw.province || 'Panamá'}`,
    tollPerInteraction: typeof raw.tollPerInteraction === 'number' ? raw.tollPerInteraction : DEFAULT_TOLL_USD,
  };
}

function buildContractPayload({ company, tollUsdPerInteraction }) {
  const interactionDefinition =
    'Interacción = acceso a vacante (web), consulta o chat por chatbot, o visualización del detalle de la vacante.';
  const billingTerms =
    'Facturación mensual emulada tipo DGI Panamá. Se calcula peaje por interacción + ITBMS 7%. Pago contra factura emitida por la Empresa Consultora.';

  const contractJson = {
    version: 'v1-panama',
    jurisdiction: { country: 'Panamá', province: company.province, district: company.district },
    company: {
      id: company.id,
      commercialName: company.commercialName || company.name,
      legalName: company.legalName,
      ruc: company.ruc,
      dv: company.dv,
      nit: company.nit,
      province: company.province,
      district: company.district,
      corregimiento: company.corregimiento,
    },
    toll: {
      currency: 'USD',
      perInteraction: tollUsdPerInteraction,
      interactions: ['acceso web a vacante', 'chatbot', 'visualización de detalle'],
      itbms: 0.07,
    },
    billing: {
      cadence: 'mensual',
      method: 'factura emulada DGI Panamá',
      delivery: 'enlace HTML público',
    },
    generatedAt: new Date().toISOString(),
  };

  const tollDescription = `Peaje por interacción: USD ${tollUsdPerInteraction.toFixed(
    2,
  )} + ITBMS 7% aplicado en la factura mensual.`;

  const contractHtml = `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><title>Contrato Digital - Peaje por Interacción</title></head>
<body style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height: 1.5; padding: 16px;">
  <h1>Contrato Digital de Peaje</h1>
  <p><strong>Empresa:</strong> ${company.legalName} (${company.ruc || 'RUC pendiente'}-${
    company.dv || 'DV'
  })</p>
  <p><strong>Ubicación:</strong> ${company.district || 'Panamá'}, ${company.province || 'Panamá'}</p>
  <p><strong>Peaje por interacción:</strong> USD ${tollUsdPerInteraction.toFixed(2)} (ITBMS 7% se adiciona en factura).</p>
  <h3>Qué se considera una interacción</h3>
  <ul>
    <li>Acceso web a una vacante</li>
    <li>Consulta o chat vía chatbot asociado a vacante</li>
    <li>Visualización del detalle de la vacante</li>
  </ul>
  <h3>Facturación</h3>
  <p>${billingTerms}</p>
  <p style="color:#555;">Documento generado automáticamente por el prototipo Bonaparte (v1-panama).</p>
</body>
</html>`;

  return {
    tollDescription,
    interactionDefinition,
    billingTerms,
    tollUsdPerInteraction,
    contractJson,
    contractHtml,
    contractVersion: 'v1-panama',
  };
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
    const normalizedCompany = normalizeCompanyPayload(company || {});
    const createdCompany = await createCompany(normalizedCompany);
    const companyId = createdCompany.id;
    const userId = randomUUID();

    const contract = buildContractPayload({
      company: { ...createdCompany, tollPerInteraction: normalizedCompany.tollPerInteraction },
      tollUsdPerInteraction: normalizedCompany.tollPerInteraction,
    });

    await pool.query(
      `
        INSERT INTO company_contracts (
          company_id, accepted, accepted_at, toll_description, toll_usd_per_interaction,
          interaction_definition, billing_terms, contract_html, contract_json, contract_version
        ) VALUES (?, 0, NULL, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        companyId,
        contract.tollDescription,
        contract.tollUsdPerInteraction,
        contract.interactionDefinition,
        contract.billingTerms,
        contract.contractHtml,
        JSON.stringify(contract.contractJson),
        contract.contractVersion,
      ],
    );

    const passwordHash = await bcrypt.hash(String(password), 10);
    await pool.query(
      'INSERT INTO users (id, username, password_hash, role, company_id) VALUES (?, ?, ?, ?, ?)',
      [userId, String(username), passwordHash, 'empresa', companyId],
    );

    const token = signAccessToken({ sub: userId, role: 'empresa', companyId });
    res.status(201).json({
      ok: true,
      company: createdCompany,
      contract: { ...contract, accepted: false },
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

    const rawUsername = (req.body && req.body.username ? String(req.body.username) : '').trim();
    const rawPassword = req.body && req.body.password;

    if (!rawUsername || !rawPassword) {
      return res.status(400).json({ error: 'username y password son requeridos', hint: 'Acceso público usa headers x-role para pruebas rápidas.' });
    }

    const [rows] = await pool.query(
      'SELECT id, username, password_hash, role, company_id FROM users WHERE username = ? LIMIT 1',
      [rawUsername],
    );

    const user = Array.isArray(rows) && rows[0];
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas', hint: 'Verifica usuario/contraseña. Demo: consultora_demo/empresa_chiriqui/empresa_panama con demo123.' });

    const ok = await bcrypt.compare(String(rawPassword), user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas', hint: 'La contraseña distingue mayúsculas/minúsculas.' });

    const tokenPayload = { sub: user.id, role: user.role, companyId: user.company_id || null };
    const token = signAccessToken(tokenPayload);

    res.json({
      ok: true,
      role: user.role,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        companyId: user.company_id || null,
      },
      notice: 'JWT emitido. Acceso público sin registro sigue disponible para explorar vacantes/peaje.',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
