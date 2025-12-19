const express = require('express');
const {
  listVacancies,
  getVacancyById,
  createVacancy,
  updateVacancy,
  deleteVacancy,
  recordInteraction,
  getCompanyById,
} = require('../storage/mysql-repo');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/mine', authenticate, requireRole('empresa'), async (req, res, next) => {
  try {
    if (!req.user.companyId) return res.status(400).json({ error: 'Empresa no asociada al usuario' });
    const items = await listVacancies({ companyId: req.user.companyId });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const companyId = req.query.companyId;
    const items = await listVacancies({ companyId });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const vacancy = await getVacancyById(req.params.id);
    if (!vacancy) return res.status(404).json({ error: 'Vacante no encontrada' });

    // Registrar interacción (acceso) para facturación
    await recordInteraction({ vacancyId: vacancy.id, event: 'view', channel: 'web' });

    res.json(vacancy);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, requireRole('empresa'), async (req, res, next) => {
  try {
    const { title, description, location, salary, status } = req.body || {};
    const companyId = req.body && req.body.companyId ? req.body.companyId : req.user.companyId;
    if (!companyId) return res.status(400).json({ error: 'companyId es requerido' });
    if (!title) return res.status(400).json({ error: 'title es requerido' });

    if (req.user.companyId && req.user.companyId !== companyId) {
      return res.status(403).json({ error: 'No puedes crear vacantes para otra empresa' });
    }

    const company = await getCompanyById(companyId);
    if (!company) return res.status(400).json({ error: 'companyId inválido' });

    const vacancy = await createVacancy({ companyId, title, description, location, salary, status });
    res.status(201).json(vacancy);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, requireRole('empresa'), async (req, res, next) => {
  try {
    const existing = await getVacancyById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Vacante no encontrada' });
    if (req.user.companyId && req.user.companyId !== existing.companyId) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    const updated = await updateVacancy(existing.id, req.body || {});
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, requireRole('empresa'), async (req, res, next) => {
  try {
    const existing = await getVacancyById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Vacante no encontrada' });
    if (req.user.companyId && req.user.companyId !== existing.companyId) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    const existed = await deleteVacancy(existing.id);
    if (!existed) return res.status(404).json({ error: 'Vacante no encontrada' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
