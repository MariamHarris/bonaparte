const express = require('express');

const router = express.Router();

// MVP: Auth emulada (solo para prototipo)
// - Empresa: x-role: empresa
// - Consultora: x-role: consultora

router.post('/login', (req, res) => {
  const { role } = req.body || {};
  if (role !== 'empresa' && role !== 'consultora') {
    return res.status(400).json({ error: "role debe ser 'empresa' o 'consultora'" });
  }
  // En producción: devolver JWT
  res.json({ ok: true, role, token: `demo-${role}-token` });
});

module.exports = router;
