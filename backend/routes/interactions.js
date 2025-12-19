const express = require('express');
const { requireConsultora } = require('../middleware/auth');
const { listInteractions } = require('../storage/mysql-repo');

const router = express.Router();

// Solo consultora: ver estadísticas de interacciones
router.get('/', requireConsultora, async (req, res, next) => {
  try {
    const vacancyId = req.query.vacancyId;
    const items = await listInteractions({ vacancyId });
    res.json({ count: items.length, items });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
