const express = require('express');
const { vacancies, companies, createVacancy, recordInteraction } = require('../storage/memory');
const { requireEmpresa } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const companyId = req.query.companyId;
  const all = Array.from(vacancies.values());
  res.json(companyId ? all.filter((v) => v.companyId === companyId) : all);
});

router.get('/:id', (req, res) => {
  const vacancy = vacancies.get(req.params.id);
  if (!vacancy) return res.status(404).json({ error: 'Vacante no encontrada' });

  // Registrar interacción (acceso) para facturación
  recordInteraction({ vacancyId: vacancy.id, event: 'view', channel: 'web' });

  res.json(vacancy);
});

router.post('/', requireEmpresa, (req, res) => {
  const { companyId, title, description, location, salary, status } = req.body || {};
  if (!companyId) return res.status(400).json({ error: 'companyId es requerido' });
  if (!companies.get(companyId)) return res.status(400).json({ error: 'companyId inválido' });
  if (!title) return res.status(400).json({ error: 'title es requerido' });

  const vacancy = createVacancy({ companyId, title, description, location, salary, status });
  res.status(201).json(vacancy);
});

router.put('/:id', requireEmpresa, (req, res) => {
  const vacancy = vacancies.get(req.params.id);
  if (!vacancy) return res.status(404).json({ error: 'Vacante no encontrada' });

  const patch = req.body || {};
  const updated = {
    ...vacancy,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  vacancies.set(vacancy.id, updated);
  res.json(updated);
});

router.delete('/:id', requireEmpresa, (req, res) => {
  const existed = vacancies.delete(req.params.id);
  if (!existed) return res.status(404).json({ error: 'Vacante no encontrada' });
  res.status(204).send();
});

module.exports = router;
