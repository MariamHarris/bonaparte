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
  const formatMoney = (n) => Number(n || 0).toFixed(2);
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
      <div><strong>Cliente:</strong> ${escapeHtml(company.legalName || company.name)} (${escapeHtml(company.type)})</div>
      <div><strong>RUC/DV:</strong> ${escapeHtml(`${dgi.ruc || 'pendiente'}-${dgi.dv || 'DV'}`)}</div>
      <div><strong>Provincia/Distrito:</strong> ${escapeHtml(`${company.province || 'Panamá'} / ${company.district || 'Panamá'}`)}</div>
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
            <td>Interacciones (accesos/chat/visualizaciones)</td>
            <td class="right">${escapeHtml(invoice.interactionsCount)}</td>
            <td class="right">${escapeHtml(formatMoney(invoice.tollPerInteraction))}</td>
            <td class="right">${escapeHtml(formatMoney(invoice.subtotal))}</td>
          </tr>
          <tr>
            <td>ITBMS ${escapeHtml(formatMoney(dgi.itbmsRate || invoice.itbmsRate || 7))}%</td>
            <td></td>
            <td></td>
            <td class="right">${escapeHtml(formatMoney(invoice.itbmsAmount))}</td>
          </tr>
        </tbody>
      </table>
      <div class="right total">Total (con ITBMS): ${escapeHtml(formatMoney(invoice.grandTotal || invoice.total))}</div>
      <div class="muted">Estado: ${escapeHtml(invoice.status)}</div>
    </div>

    <p class="muted">Documento generado por prototipo Bonaparte. Emula un comprobante fiscal DGI Panamá para fines académicos.</p>
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
