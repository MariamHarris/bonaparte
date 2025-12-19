const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

const PY_ANALYTICS_URL = process.env.PY_ANALYTICS_URL;
const PY_ANALYTICS_TOKEN = process.env.PY_ANALYTICS_TOKEN || process.env.ANALYTICS_TOKEN;

async function callPython(path, query, opts = {}) {
  if (!PY_ANALYTICS_URL) {
    const err = new Error('PY_ANALYTICS_URL no configurada');
    err.statusCode = 503;
    throw err;
  }
  const url = new URL(path, PY_ANALYTICS_URL);
  Object.entries(query || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });

  const headers = { 'Content-Type': 'application/json' };
  if (PY_ANALYTICS_TOKEN) headers['x-api-key'] = PY_ANALYTICS_TOKEN;

  const res = await fetch(url.toString(), {
    method: opts.method || 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const err = new Error((data && data.detail) || (data && data.error) || `HTTP ${res.status}`);
    err.statusCode = res.status;
    throw err;
  }

  return data;
}

router.get('/summary', authenticate, requireRole('consultora'), async (req, res, next) => {
  try {
    const payload = await callPython('/analytics/summary', {
      start: req.query.start,
      end: req.query.end,
    });
    res.json(payload);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
