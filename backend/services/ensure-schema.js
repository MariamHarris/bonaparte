const { randomUUID } = require('crypto');

async function ensureSchema(pool) {
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
