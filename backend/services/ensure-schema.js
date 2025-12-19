const { randomUUID } = require('crypto');

async function columnExists(pool, table, column) {
  const [rows] = await pool.query(`SHOW COLUMNS FROM ${table} LIKE ?`, [column]);
  return Array.isArray(rows) && rows.length > 0;
}

async function addColumnIfMissing(pool, table, column, definition) {
  const exists = await columnExists(pool, table, column);
  if (exists) return;
  await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

async function ensureSchema(pool) {
  // Campos adicionales para empresas (Panamá)
  await addColumnIfMissing(pool, 'companies', 'commercial_name', 'VARCHAR(255) NULL AFTER name');
  await addColumnIfMissing(pool, 'companies', 'legal_name', 'VARCHAR(255) NULL AFTER commercial_name');
  await addColumnIfMissing(pool, 'companies', 'ruc', 'VARCHAR(50) NULL AFTER legal_name');
  await addColumnIfMissing(pool, 'companies', 'dv', 'VARCHAR(10) NULL AFTER ruc');
  await addColumnIfMissing(pool, 'companies', 'nit', 'VARCHAR(50) NULL AFTER dv');
  await addColumnIfMissing(pool, 'companies', 'province', 'VARCHAR(100) NULL AFTER nit');
  await addColumnIfMissing(pool, 'companies', 'district', 'VARCHAR(100) NULL AFTER province');
  await addColumnIfMissing(pool, 'companies', 'corregimiento', 'VARCHAR(100) NULL AFTER district');

  // Interacciones con referencia directa a la empresa
  await addColumnIfMissing(pool, 'interactions', 'company_id', 'CHAR(36) NULL AFTER vacancy_id');
  await addColumnIfMissing(pool, 'interactions', 'intent', 'VARCHAR(100) NULL AFTER event');

  // Facturas con ITBMS y numeración fiscal
  await addColumnIfMissing(pool, 'invoices', 'subtotal', 'DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER toll_per_interaction');
  await addColumnIfMissing(pool, 'invoices', 'itbms_rate', 'DECIMAL(5,2) NOT NULL DEFAULT 7.00 AFTER subtotal');
  await addColumnIfMissing(pool, 'invoices', 'itbms_amount', 'DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER itbms_rate');
  await addColumnIfMissing(pool, 'invoices', 'grand_total', 'DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER total');
  await addColumnIfMissing(pool, 'invoices', 'fiscal_number', 'VARCHAR(50) NULL AFTER grand_total');

  // Contrato digital enriquecido
  await addColumnIfMissing(pool, 'company_contracts', 'toll_usd_per_interaction', "DECIMAL(10,2) NOT NULL DEFAULT 0.25 AFTER toll_description");
  await addColumnIfMissing(pool, 'company_contracts', 'interaction_definition', 'TEXT NULL AFTER toll_usd_per_interaction');
  await addColumnIfMissing(pool, 'company_contracts', 'billing_terms', 'TEXT NULL AFTER interaction_definition');
  await addColumnIfMissing(pool, 'company_contracts', 'contract_html', 'MEDIUMTEXT NULL AFTER billing_terms');
  await addColumnIfMissing(pool, 'company_contracts', 'contract_json', 'JSON NULL AFTER contract_html');
  await addColumnIfMissing(pool, 'company_contracts', 'contract_version', "VARCHAR(50) NULL DEFAULT 'v1-panama' AFTER contract_json");

  // users
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id CHAR(36) PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('empresa','consultora') NOT NULL,
      company_id CHAR(36) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_user_company FOREIGN KEY (company_id) REFERENCES companies(id)
    )
  `);

  // contract status per company
  await pool.query(`
    CREATE TABLE IF NOT EXISTS company_contracts (
      company_id CHAR(36) PRIMARY KEY,
      accepted TINYINT(1) NOT NULL DEFAULT 0,
      accepted_at DATETIME NULL,
      toll_description TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_contract_company FOREIGN KEY (company_id) REFERENCES companies(id)
    )
  `);

  // invoice HTML files (served via nginx)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS invoice_files (
      invoice_id CHAR(36) PRIMARY KEY,
      relative_path VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_invoice_file FOREIGN KEY (invoice_id) REFERENCES invoices(id)
    )
  `);

  // Small sanity check to ensure schema is usable
  await pool.query('SELECT 1');
}

module.exports = { ensureSchema };
