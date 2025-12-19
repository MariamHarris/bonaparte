-- Esquema inicial (MVP) para Bonaparte

CREATE TABLE IF NOT EXISTS companies (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  commercial_name VARCHAR(255),
  legal_name VARCHAR(255),
  ruc VARCHAR(50),
  dv VARCHAR(10),
  nit VARCHAR(50),
  province VARCHAR(100),
  district VARCHAR(100),
  corregimiento VARCHAR(100),
  type ENUM('public','private') NOT NULL DEFAULT 'private',
  email VARCHAR(255),
  phone VARCHAR(50),
  address VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vacancies (
  id CHAR(36) PRIMARY KEY,
  company_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  salary VARCHAR(100),
  status ENUM('open','closed') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_vacancy_company FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE IF NOT EXISTS interactions (
  id CHAR(36) PRIMARY KEY,
  vacancy_id CHAR(36) NOT NULL,
  company_id CHAR(36) NULL,
  channel VARCHAR(50) NOT NULL DEFAULT 'web',
  event VARCHAR(50) NOT NULL DEFAULT 'view',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_interaction_vacancy FOREIGN KEY (vacancy_id) REFERENCES vacancies(id),
  CONSTRAINT fk_interaction_company FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE IF NOT EXISTS invoices (
  id CHAR(36) PRIMARY KEY,
  company_id CHAR(36) NOT NULL,
  period_start DATETIME NOT NULL,
  period_end DATETIME NOT NULL,
  interactions_count INT NOT NULL,
  toll_per_interaction DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  itbms_rate DECIMAL(5,2) NOT NULL DEFAULT 7.00,
  itbms_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  grand_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  fiscal_number VARCHAR(50),
  status ENUM('draft','issued','paid','void') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_invoice_company FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('empresa','consultora') NOT NULL,
  company_id CHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_company FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE IF NOT EXISTS company_contracts (
  company_id CHAR(36) PRIMARY KEY,
  accepted TINYINT(1) NOT NULL DEFAULT 0,
  accepted_at DATETIME NULL,
  toll_description TEXT NOT NULL,
  toll_usd_per_interaction DECIMAL(10,2) NOT NULL DEFAULT 0.25,
  interaction_definition TEXT,
  billing_terms TEXT,
  contract_html MEDIUMTEXT,
  contract_json JSON,
  contract_version VARCHAR(50) DEFAULT 'v1-panama',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_contract_company FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE IF NOT EXISTS invoice_files (
  invoice_id CHAR(36) PRIMARY KEY,
  relative_path VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_invoice_file FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);
