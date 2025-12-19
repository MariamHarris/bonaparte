-- Esquema inicial (MVP) para Bonaparte

CREATE TABLE IF NOT EXISTS companies (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
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
  channel VARCHAR(50) NOT NULL DEFAULT 'web',
  event VARCHAR(50) NOT NULL DEFAULT 'view',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_interaction_vacancy FOREIGN KEY (vacancy_id) REFERENCES vacancies(id)
);

CREATE TABLE IF NOT EXISTS invoices (
  id CHAR(36) PRIMARY KEY,
  company_id CHAR(36) NOT NULL,
  period_start DATETIME NOT NULL,
  period_end DATETIME NOT NULL,
  interactions_count INT NOT NULL,
  toll_per_interaction DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status ENUM('draft','issued','paid','void') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_invoice_company FOREIGN KEY (company_id) REFERENCES companies(id)
);
