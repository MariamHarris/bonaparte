const express = require('express');
const { interactions } = require('../storage/memory');
const { requireConsultora } = require('../middleware/auth');

const router = express.Router();

// Solo consultora: ver estadísticas de interacciones
router.get('/', requireConsultora, (req, res) => {
  const vacancyId = req.query.vacancyId;
  const filtered = vacancyId ? interactions.filter((i) => i.vacancyId === vacancyId) : interactions;
  res.json({ count: filtered.length, items: filtered });
});

module.exports = router;
