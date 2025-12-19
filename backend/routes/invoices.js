const express = require('express');
const { interactions, createInvoice, invoices } = require('../storage/memory');
const { requireConsultora } = require('../middleware/auth');

const router = express.Router();

// MVP: generar factura por peaje (simulación tipo DGI)
router.post('/generate', requireConsultora, (req, res) => {
  const { companyId, periodStart, periodEnd, tollPerInteraction } = req.body || {};
  if (!companyId) return res.status(400).json({ error: 'companyId es requerido' });
  if (!periodStart || !periodEnd) return res.status(400).json({ error: 'periodStart y periodEnd son requeridos' });

  const start = new Date(periodStart);
  const end = new Date(periodEnd);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return res.status(400).json({ error: 'Fechas inválidas' });
  }

  const toll = typeof tollPerInteraction === 'number' ? tollPerInteraction : 0.25;

  // MVP: contamos todas las interacciones (en producción: filtrar por empresa/vacante)
  const interactionsCount = interactions.filter((i) => {
    const t = new Date(i.createdAt).getTime();
    return t >= start.getTime() && t <= end.getTime();
  }).length;

  const total = Number((interactionsCount * toll).toFixed(2));

  const invoice = createInvoice({
    companyId,
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
    interactionsCount,
    tollPerInteraction: toll,
    total,
    status: 'issued',
  });

  res.status(201).json({
    invoice,
    dgiEmulation: {
      fiscalNumber: `FISC-${invoice.id.slice(0, 8).toUpperCase()}`,
      type: 'Factura Fiscal (Emulada)',
    },
  });
});

router.get('/', requireConsultora, (req, res) => {
  res.json(Array.from(invoices.values()));
});

router.get('/:id', requireConsultora, (req, res) => {
  const invoice = invoices.get(req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Factura no encontrada' });
  res.json(invoice);
});

module.exports = router;
