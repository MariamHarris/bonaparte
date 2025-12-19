const express = require('express');
const { authenticate, requireConsultora } = require('../middleware/auth');
const {
  countInteractionsForCompany,
  createInvoice,
  listInvoices,
  listInvoicesByCompany,
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

    const toll = typeof tollPerInteraction === 'number' ? Number(tollPerInteraction) : 0.25;
    const interactionsCount = await countInteractionsForCompany({
      companyId,
      start,
      end,
    });

    const subtotal = Number((interactionsCount * toll).toFixed(2));
    const itbmsRate = 7.0;
    const itbmsAmount = Number((subtotal * (itbmsRate / 100)).toFixed(2));
    const grandTotal = Number((subtotal + itbmsAmount).toFixed(2));
    const fiscalNumber = `BPA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

    const invoice = await createInvoice({
      companyId,
      periodStart: start,
      periodEnd: end,
      interactionsCount,
      tollPerInteraction: toll,
      subtotal,
      itbmsRate,
      itbmsAmount,
      total: grandTotal,
      grandTotal,
      fiscalNumber,
      status: 'issued',
    });

    const dgiEmulation = {
      fiscalNumber: invoice.fiscalNumber || fiscalNumber,
      ruc: company.ruc || '155-789-456',
      dv: company.dv || '82',
      nit: company.nit || null,
      itbmsRate,
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

// Empresa: generar su propia factura (ventana móvil 30 días)
router.post('/generate/my', authenticate, async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'empresa') {
      return res.status(403).json({ error: 'Acceso solo para empresa' });
    }
    if (!req.user.companyId) {
      return res.status(400).json({ error: 'Empresa no asociada al usuario' });
    }

    const companyId = req.user.companyId;
    const company = await getCompanyById(companyId);
    if (!company) return res.status(404).json({ error: 'Empresa no encontrada' });

    const now = new Date();
    const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const end = now;
    const toll = typeof req.body?.tollPerInteraction === 'number' ? Number(req.body.tollPerInteraction) : 0.25;

    const interactionsCount = await countInteractionsForCompany({ companyId, start, end });
    const subtotal = Number((interactionsCount * toll).toFixed(2));
    const itbmsRate = 7.0;
    const itbmsAmount = Number((subtotal * (itbmsRate / 100)).toFixed(2));
    const grandTotal = Number((subtotal + itbmsAmount).toFixed(2));
    const fiscalNumber = `BPA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

    const invoice = await createInvoice({
      companyId,
      periodStart: start,
      periodEnd: end,
      interactionsCount,
      tollPerInteraction: toll,
      subtotal,
      itbmsRate,
      itbmsAmount,
      total: grandTotal,
      grandTotal,
      fiscalNumber,
      status: 'issued',
    });

    const dgiEmulation = {
      fiscalNumber: invoice.fiscalNumber || fiscalNumber,
      ruc: company.ruc || '155-789-456',
      dv: company.dv || '82',
      nit: company.nit || null,
      itbmsRate,
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

// Empresa: listado de sus propias facturas
router.get('/my', authenticate, async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'empresa') {
      return res.status(403).json({ error: 'Acceso solo para empresa' });
    }
    if (!req.user.companyId) {
      return res.status(400).json({ error: 'Empresa no asociada al usuario' });
    }

    const items = await listInvoicesByCompany(req.user.companyId);
    const base = process.env.INVOICES_PUBLIC_BASE || 'http://localhost:8080';

    // Adjuntamos publicUrl si existe archivo
    const withFiles = await Promise.all(
      items.map(async (inv) => {
        const file = await getInvoiceFile(inv.id);
        return {
          ...inv,
          file: file
            ? { ...file, publicUrl: `${base.replace(/\/$/, '')}/${file.relativePath}` }
            : null,
        };
      }),
    );

    res.json(withFiles);
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

// Empresa: ver detalle de una factura (solo si es de su empresa)
router.get('/:id/my', authenticate, async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'empresa') {
      return res.status(403).json({ error: 'Acceso solo para empresa' });
    }
    if (!req.user.companyId) {
      return res.status(400).json({ error: 'Empresa no asociada al usuario' });
    }

    const invoice = await getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Factura no encontrada' });
    if (invoice.companyId !== req.user.companyId) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

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
