const path = require('path');
const fs = require('fs/promises');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildInvoiceHtml({ invoice, company, dgi }) {
  const title = `Factura Fiscal (Emulada) - ${dgi.fiscalNumber}`;
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 24px; }
      h1 { margin: 0 0 4px; }
      .muted { color: #555; }
      .box { border: 1px solid #ddd; border-radius: 10px; padding: 16px; margin-top: 16px; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { text-align: left; border-bottom: 1px solid #eee; padding: 10px 8px; }
      .right { text-align: right; }
      .total { font-size: 18px; font-weight: 700; }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(title)}</h1>
    <div class="muted">Generada: ${escapeHtml(invoice.createdAt || new Date().toISOString())}</div>

    <div class="box">
      <div><strong>Número fiscal:</strong> ${escapeHtml(dgi.fiscalNumber)}</div>
      <div><strong>Cliente:</strong> ${escapeHtml(company.name)} (${escapeHtml(company.type)})</div>
      <div><strong>Periodo:</strong> ${escapeHtml(invoice.periodStart)} → ${escapeHtml(invoice.periodEnd)}</div>
    </div>

    <div class="box">
      <table>
        <thead>
          <tr>
            <th>Concepto</th>
            <th class="right">Cantidad</th>
            <th class="right">Peaje</th>
            <th class="right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Interacciones (accesos a vacantes)</td>
            <td class="right">${escapeHtml(invoice.interactionsCount)}</td>
            <td class="right">${escapeHtml(invoice.tollPerInteraction)}</td>
            <td class="right">${escapeHtml(invoice.total)}</td>
          </tr>
        </tbody>
      </table>
      <div class="right total">Total: ${escapeHtml(invoice.total)}</div>
      <div class="muted">Estado: ${escapeHtml(invoice.status)}</div>
    </div>

    <p class="muted">Documento generado por prototipo Bonaparte. Este documento emula un proceso de facturación fiscal (DGI) para fines académicos.</p>
  </body>
</html>`;
}

async function writeInvoiceHtmlFile({ invoiceId, html }) {
  const baseDir = path.join(process.cwd(), 'public', 'invoices');
  await fs.mkdir(baseDir, { recursive: true });
  const filename = `${invoiceId}.html`;
  const filePath = path.join(baseDir, filename);
  await fs.writeFile(filePath, html, 'utf8');
  return { relativePath: path.posix.join('invoices', filename) };
}

module.exports = { buildInvoiceHtml, writeInvoiceHtmlFile };
