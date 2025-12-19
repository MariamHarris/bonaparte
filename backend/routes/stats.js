const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const {
  getCompanyById,
  getVacancyById,
  getCompanyInteractionStats,
  getVacancyInteractionStats,
  getContract,
} = require('../storage/mysql-repo');

const router = express.Router();

function parseDate(value, fallback) {
  if (!value) return fallback;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;
  return d;
}

function toMoney(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return 0;
  return Number(num.toFixed(2));
}

function computeBilling({ interactionsCount, tollPerInteraction, itbmsRate = 7.0 }) {
  const subtotal = toMoney(Number(interactionsCount) * Number(tollPerInteraction));
  const itbmsAmount = toMoney(subtotal * (Number(itbmsRate) / 100));
  const total = toMoney(subtotal + itbmsAmount);
  return { interactionsCount: Number(interactionsCount) || 0, tollPerInteraction: Number(tollPerInteraction) || 0, subtotal, itbmsRate: Number(itbmsRate), itbmsAmount, total };
}

function pickTollFromQuery(req, fallback) {
  const raw = req.query.tollPerInteraction;
  if (raw === undefined || raw === null || raw === '') return fallback;
  const n = Number(raw);
  if (Number.isNaN(n)) return fallback;
  return n;
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
      const toll = pickTollFromQuery(req, 0.25);
      const billing = computeBilling({ interactionsCount: stats.total, tollPerInteraction: toll, itbmsRate: 7.0 });
      return res.json({ scope: 'company', company, start: start.toISOString(), end: end.toISOString(), stats, billing });
    }

    if (vacancyId) {
      const vacancy = await getVacancyById(String(vacancyId));
      if (!vacancy) return res.status(404).json({ error: 'Vacante no encontrada' });
      const stats = await getVacancyInteractionStats({ vacancyId: vacancy.id, start, end });
      const toll = pickTollFromQuery(req, 0.25);
      const billing = computeBilling({ interactionsCount: stats.total, tollPerInteraction: toll, itbmsRate: 7.0 });
      return res.json({ scope: 'vacancy', vacancy, start: start.toISOString(), end: end.toISOString(), stats, billing });
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

    const contract = await getContract(company.id);
    const contractToll = contract && typeof contract.tollUsdPerInteraction === 'number' ? contract.tollUsdPerInteraction : 0.25;
    const toll = pickTollFromQuery(req, contractToll);

    const vacancyId = req.query.vacancyId ? String(req.query.vacancyId) : null;
    if (vacancyId) {
      const vacancy = await getVacancyById(vacancyId);
      if (!vacancy) return res.status(404).json({ error: 'Vacante no encontrada' });
      if (vacancy.companyId !== company.id) return res.status(403).json({ error: 'Acceso denegado' });
      const stats = await getVacancyInteractionStats({ vacancyId: vacancy.id, start, end });
      const billing = computeBilling({ interactionsCount: stats.total, tollPerInteraction: toll, itbmsRate: 7.0 });
      return res.json({ scope: 'vacancy', company, vacancy, contract, start: start.toISOString(), end: end.toISOString(), stats, billing });
    }

    const stats = await getCompanyInteractionStats({ companyId: company.id, start, end });
    const billing = computeBilling({ interactionsCount: stats.total, tollPerInteraction: toll, itbmsRate: 7.0 });
    res.json({ scope: 'company', company, contract, start: start.toISOString(), end: end.toISOString(), stats, billing });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
