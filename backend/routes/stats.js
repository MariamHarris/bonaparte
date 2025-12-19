const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const {
  getCompanyById,
  getVacancyById,
  getCompanyInteractionStats,
  getVacancyInteractionStats,
} = require('../storage/mysql-repo');

const router = express.Router();

function parseDate(value, fallback) {
  if (!value) return fallback;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;
  return d;
}

// Estadísticas para consultora: por empresa (query companyId) o por vacante (query vacancyId)
router.get('/consultora', authenticate, requireRole('consultora'), async (req, res, next) => {
  try {
    const { companyId, vacancyId } = req.query;

    const end = parseDate(req.query.end, new Date());
    const start = parseDate(req.query.start, new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000));

    if (companyId) {
      const company = await getCompanyById(String(companyId));
      if (!company) return res.status(404).json({ error: 'Empresa no encontrada' });
      const stats = await getCompanyInteractionStats({ companyId: company.id, start, end });
      return res.json({ scope: 'company', company, start: start.toISOString(), end: end.toISOString(), stats });
    }

    if (vacancyId) {
      const vacancy = await getVacancyById(String(vacancyId));
      if (!vacancy) return res.status(404).json({ error: 'Vacante no encontrada' });
      const stats = await getVacancyInteractionStats({ vacancyId: vacancy.id, start, end });
      return res.json({ scope: 'vacancy', vacancy, start: start.toISOString(), end: end.toISOString(), stats });
    }

    return res.status(400).json({ error: 'Debe enviar companyId o vacancyId' });
  } catch (err) {
    next(err);
  }
});

// Estadísticas para empresa: solo su propia empresa (usa req.user.companyId)
router.get('/empresa', authenticate, requireRole('empresa'), async (req, res, next) => {
  try {
    if (!req.user.companyId) return res.status(400).json({ error: 'Empresa no asociada al usuario' });

    const end = parseDate(req.query.end, new Date());
    const start = parseDate(req.query.start, new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000));

    const company = await getCompanyById(req.user.companyId);
    if (!company) return res.status(404).json({ error: 'Empresa no encontrada' });

    const stats = await getCompanyInteractionStats({ companyId: company.id, start, end });
    res.json({ scope: 'company', company, start: start.toISOString(), end: end.toISOString(), stats });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
