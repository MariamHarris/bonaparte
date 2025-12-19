const express = require('express');
const { requireConsultora } = require('../middleware/auth');
const {
  countInteractionsForCompany,
  createInvoice,
  listInvoices,
  getInvoiceById,
  getCompanyById,
  upsertInvoiceFile,
  getInvoiceFile,
} = require('../storage/mysql-repo');
const { buildInvoiceHtml, writeInvoiceHtmlFile } = require('../services/invoice-html');

const router = express.Router();

// MVP: generar factura por peaje (simulación tipo DGI)
router.post('/generate', requireConsultora, async (req, res, next) => {
  try {
    const { companyId, periodStart, periodEnd, tollPerInteraction } = req.body || {};
    if (!companyId) return res.status(400).json({ error: 'companyId es requerido' });
    if (!periodStart || !periodEnd) return res.status(400).json({ error: 'periodStart y periodEnd son requeridos' });

    const company = await getCompanyById(companyId);
    if (!company) return res.status(400).json({ error: 'companyId inválido' });

    const start = new Date(periodStart);
    const end = new Date(periodEnd);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Fechas inválidas' });
    }

    const toll = typeof tollPerInteraction === 'number' ? tollPerInteraction : 0.25;
    const interactionsCount = await countInteractionsForCompany({
      companyId,
      start,
      end,
    });

    const total = Number((interactionsCount * toll).toFixed(2));
    const invoice = await createInvoice({
      companyId,
      periodStart: start,
      periodEnd: end,
      interactionsCount,
      tollPerInteraction: toll,
      total,
      status: 'issued',
    });

    const dgiEmulation = {
      fiscalNumber: `FISC-${invoice.id.slice(0, 8).toUpperCase()}`,
      type: 'Factura Fiscal (Emulada)',
    };

    const html = buildInvoiceHtml({ invoice, company, dgi: dgiEmulation });
    const { relativePath } = await writeInvoiceHtmlFile({ invoiceId: invoice.id, html });
    await upsertInvoiceFile({ invoiceId: invoice.id, relativePath });

    const base = process.env.INVOICES_PUBLIC_BASE || 'http://localhost:8080';
    const publicUrl = `${base.replace(/\/$/, '')}/${relativePath}`;

    res.status(201).json({
      invoice,
      dgiEmulation,
      file: { relativePath, publicUrl },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/', requireConsultora, async (req, res, next) => {
  try {
    const items = await listInvoices();
    res.json(items);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', requireConsultora, async (req, res, next) => {
  try {
    const invoice = await getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Factura no encontrada' });
    const file = await getInvoiceFile(invoice.id);
    const base = process.env.INVOICES_PUBLIC_BASE || 'http://localhost:8080';
    res.json({
      ...invoice,
      file: file
        ? { ...file, publicUrl: `${base.replace(/\/$/, '')}/${file.relativePath}` }
        : null,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
