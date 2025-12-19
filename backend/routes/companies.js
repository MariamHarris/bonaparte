const express = require('express');
const { companies, createCompany } = require('../storage/memory');
const { requireEmpresa } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(Array.from(companies.values()));
});

router.get('/:id', (req, res) => {
  const company = companies.get(req.params.id);
  if (!company) return res.status(404).json({ error: 'Empresa no encontrada' });
  res.json(company);
});

router.post('/', requireEmpresa, (req, res) => {
  const { name, type, email, phone, address } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name es requerido' });
  const company = createCompany({ name, type, email, phone, address });
  // MVP: contrato digital emulado
  res.status(201).json({
    company,
    contract: {
      accepted: false,
      tollDescription:
        'El costo del peaje se calculará por interacción (accesos a vacantes).',
    },
  });
});

router.put('/:id', requireEmpresa, (req, res) => {
  const company = companies.get(req.params.id);
  if (!company) return res.status(404).json({ error: 'Empresa no encontrada' });

  const patch = req.body || {};
  const updated = {
    ...company,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  companies.set(company.id, updated);
  res.json(updated);
});

router.delete('/:id', requireEmpresa, (req, res) => {
  const existed = companies.delete(req.params.id);
  if (!existed) return res.status(404).json({ error: 'Empresa no encontrada' });
  res.status(204).send();
});

module.exports = router;
