const express = require('express');
const {
  listCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  getContract,
  acceptContract,
} = require('../storage/mysql-repo');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

function ensureCompanyBound(req, res) {
  if (!req.user || !req.user.companyId) {
    res.status(400).json({ error: 'Empresa no asociada al usuario' });
    return null;
  }
  return req.user.companyId;
}

router.get('/me', authenticate, requireRole('empresa'), async (req, res, next) => {
  try {
    const companyId = ensureCompanyBound(req, res);
    if (!companyId) return;
    const company = await getCompanyById(companyId);
    if (!company) return res.status(404).json({ error: 'Empresa no encontrada' });
    const contract = await getContract(companyId);
    res.json({ company, contract });
  } catch (err) {
    next(err);
  }
});

router.put('/me', authenticate, requireRole('empresa'), async (req, res, next) => {
  try {
    const companyId = ensureCompanyBound(req, res);
    if (!companyId) return;
    const updated = await updateCompany(companyId, req.body || {});
    if (!updated) return res.status(404).json({ error: 'Empresa no encontrada' });
    const contract = await getContract(companyId);
    res.json({ company: updated, contract });
  } catch (err) {
    next(err);
  }
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    if (req.user.role === 'consultora') {
      const includeReplication = String(req.query.includeReplication || '').toLowerCase() === 'true';
      const items = await listCompanies();
      const filtered = includeReplication
        ? items
        : (items || []).filter((c) => !String(c.name || '').toLowerCase().startsWith('empresa replication'));
      return res.json(filtered);
    }

    if (req.user.role === 'empresa') {
      if (!req.user.companyId) return res.json([]);
      const company = await getCompanyById(req.user.companyId);
      return res.json(company ? [company] : []);
    }

    res.status(403).json({ error: 'Acceso denegado' });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.user.role === 'empresa' && req.user.companyId && req.user.companyId !== id) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    const company = await getCompanyById(id);
    if (!company) return res.status(404).json({ error: 'Empresa no encontrada' });
    res.json(company);
  } catch (err) {
    next(err);
  }
});

// La creación de empresa + usuario se hace por /api/auth/register/company
router.post('/', authenticate, requireRole('consultora'), async (req, res, next) => {
  try {
    res.status(400).json({ error: 'Use /api/auth/register/company para registrar una empresa' });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.user.role === 'empresa' && req.user.companyId && req.user.companyId !== id) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    const updated = await updateCompany(id, req.body || {});
    if (!updated) return res.status(404).json({ error: 'Empresa no encontrada' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, requireRole('consultora'), async (req, res, next) => {
  try {
    const existed = await deleteCompany(req.params.id);
    if (!existed) return res.status(404).json({ error: 'Empresa no encontrada' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.get('/me/contract', authenticate, requireRole('empresa'), async (req, res, next) => {
  try {
    const companyId = ensureCompanyBound(req, res);
    if (!companyId) return;
    const contract = await getContract(companyId);
    if (!contract) return res.status(404).json({ error: 'Contrato no encontrado' });
    res.json(contract);
  } catch (err) {
    next(err);
  }
});

router.post('/me/contract/accept', authenticate, requireRole('empresa'), async (req, res, next) => {
  try {
    const companyId = ensureCompanyBound(req, res);
    if (!companyId) return;
    const updated = await acceptContract(companyId);
    if (!updated) return res.status(404).json({ error: 'Contrato no encontrado' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/contract', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.user.role === 'empresa' && req.user.companyId && req.user.companyId !== id) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    const contract = await getContract(id);
    if (!contract) return res.status(404).json({ error: 'Contrato no encontrado' });
    res.json(contract);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/contract/accept', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'empresa') return res.status(403).json({ error: 'Acceso solo para empresa' });
    if (req.user.companyId && req.user.companyId !== id) return res.status(403).json({ error: 'Acceso denegado' });

    const updated = await acceptContract(id);
    if (!updated) return res.status(404).json({ error: 'Contrato no encontrado' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
