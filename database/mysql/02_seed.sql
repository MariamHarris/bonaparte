-- ============================================================
-- DATOS SIMULADOS – REPÚBLICA DE PANAMÁ
-- Proyecto: Bonaparte – Gestión de Vacantes
-- NOTA: Los datos son ficticios, pero modelados según:
--  - División político-administrativa de Panamá
--  - Prácticas empresariales locales
--  - Formatos comunes de RUC, DV, NIT y facturación
-- ============================================================

-- Usuarios del sistema
-- Roles:
--  - consultora: Empresa Consultora (única con acceso a facturación)
--  - empresa: Representante de empresa pública o privada
-- Contraseñas: bcrypt de "demo123" (simulación académica)
INSERT IGNORE INTO users (id, username, password_hash, role, company_id) VALUES
	('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'consultora_demo', '$2b$10$sSh4uwjGMZ7hlYaq5/LSQeaUoVTdvkB4LRgt/O.BWpEAGEryFPjse', 'consultora', NULL),
	('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'empresa_chiriqui', '$2b$10$sSh4uwjGMZ7hlYaq5/LSQeaUoVTdvkB4LRgt/O.BWpEAGEryFPjse', 'empresa', '11111111-1111-1111-1111-111111111111'),
	('cccccccc-cccc-cccc-cccc-cccccccccccc', 'empresa_panama', '$2b$10$sSh4uwjGMZ7hlYaq5/LSQeaUoVTdvkB4LRgt/O.BWpEAGEryFPjse', 'empresa', '22222222-2222-2222-2222-222222222222'),
	('dddddddd-dddd-dddd-dddd-dddddddddddd', 'empresa_colon', '$2b$10$sSh4uwjGMZ7hlYaq5/LSQeaUoVTdvkB4LRgt/O.BWpEAGEryFPjse', 'empresa', '44444444-1111-4444-aaaa-000000000001'),
	('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'empresa_herrera', '$2b$10$sSh4uwjGMZ7hlYaq5/LSQeaUoVTdvkB4LRgt/O.BWpEAGEryFPjse', 'empresa', '44444444-2222-4444-aaaa-000000000002'),
	('ffffffff-ffff-ffff-ffff-ffffffffffff', 'empresa_los_santos', '$2b$10$sSh4uwjGMZ7hlYaq5/LSQeaUoVTdvkB4LRgt/O.BWpEAGEryFPjse', 'empresa', '44444444-3333-4444-aaaa-000000000003'),
	('11111111-aaaa-bbbb-cccc-000000000004', 'empresa_cocle', '$2b$10$sSh4uwjGMZ7hlYaq5/LSQeaUoVTdvkB4LRgt/O.BWpEAGEryFPjse', 'empresa', '44444444-4444-4444-aaaa-000000000004'),
	('22222222-aaaa-bbbb-cccc-000000000005', 'empresa_darien', '$2b$10$sSh4uwjGMZ7hlYaq5/LSQeaUoVTdvkB4LRgt/O.BWpEAGEryFPjse', 'empresa', '44444444-5555-4444-aaaa-000000000005'),
	('33333333-aaaa-bbbb-cccc-000000000006', 'empresa_bocas', '$2b$10$sSh4uwjGMZ7hlYaq5/LSQeaUoVTdvkB4LRgt/O.BWpEAGEryFPjse', 'empresa', '44444444-6666-4444-aaaa-000000000006');

-- ============================================================
-- Empresas registradas en Panamá
-- Provincias reales: Chiriquí, Panamá, Veraguas
-- Distritos y corregimientos coherentes con cada provincia
-- Tipos de empresa:
--  - private: Empresa privada
--  - public: Empresa pública o de interés estatal
-- RUC, DV y NIT con formato típico panameño (SIMULADO)
-- ============================================================
INSERT IGNORE INTO companies (
	id, name, commercial_name, legal_name, ruc, dv, nit,
	province, district, corregimiento, type, email, phone, address
) VALUES
	('11111111-1111-1111-1111-111111111111',
	 'Tech Chiriquí',
	 'Tech Chiriquí',
	 'Tech Chiriquí S.A.',
	 '155-789-456',     -- Formato RUC típico Panamá (simulado)
	 '82',              -- Dígito verificador (DV simulado)
	 '8-NT-001234',     -- NIT ficticio
	 'Chiriquí',
	 'David',
	 'David',
	 'private',
	 'contacto@techchiriqui.pa',
	 '+507 6300-1101',
	 'Zona Franca, David, Chiriquí'),

	('22222222-2222-2222-2222-222222222222',
	 'Transporte Canal',
	 'Transporte Canal',
	 'Transporte del Istmo, S.A.',
	 '230-456-789',
	 '15',
	 '8-NT-002345',
	 'Panamá',
	 'Panamá',
	 'San Francisco',
	 'public',
	 'rrhh@transporte.pa',
	 '+507 398-0002',
	 'Calle 50, San Francisco, Panamá'),

	('33333333-3333-3333-3333-333333333333',
	 'Agro Veraguas',
	 'Agro Veraguas',
	 'Agro Veraguas Holdings, S.A.',
	 '045-120-999',
	 '07',
	 '8-NT-003456',
	 'Veraguas',
	 'Santiago',
	 'Santiago',
	 'private',
	 'talento@agroveraguas.pa',
	 '+507 940-2211',
	 'Vía Interamericana, Santiago, Veraguas'),

	('44444444-1111-4444-aaaa-000000000001',
	 'Canal Data Labs',
	 'Canal Data Labs',
	 'Canal Data Labs, S.A.',
	 '401-889-120',
	 '18',
	 '8-NT-004567',
	 'Colón',
	 'Colón',
	 'Barrio Norte',
	 'private',
	 'info@canaldatalabs.pa',
	 '+507 448-1010',
	 'Zona Libre de Colón, Colón'),

	('44444444-2222-4444-aaaa-000000000002',
	 'Salud Herrera Pública',
	 'Salud Herrera',
	 'Caja Provincial de Salud Herrera',
	 '512-330-777',
	 '06',
	 '8-NT-004890',
	 'Herrera',
	 'Chitré',
	 'Monagrillo',
	 'public',
	 'contacto@saludherrera.gob.pa',
	 '+507 978-2202',
	 'Avenida Herrera, Chitré, Herrera'),

	('44444444-3333-4444-aaaa-000000000003',
	 'Turismo Los Santos',
	 'Turismo Los Santos',
	 'Operadora Turística Santeña, S.A.',
	 '623-455-332',
	 '11',
	 '8-NT-005321',
	 'Los Santos',
	 'Las Tablas',
	 'Guararé',
	 'private',
	 'talento@turismosantos.pa',
	 '+507 925-1144',
	 'Vía Playa El Uverito, Las Tablas, Los Santos'),

	('44444444-4444-4444-aaaa-000000000004',
	 'Agro Coclé Verde',
	 'Agro Coclé',
	 'Agro Coclé Verde, S.A.',
	 '734-210-998',
	 '04',
	 '8-NT-005876',
	 'Coclé',
	 'Penonomé',
	 'Penonomé',
	 'private',
	 'recursos@agrococle.pa',
	 '+507 987-3311',
	 'Vía Interamericana, Penonomé, Coclé'),

	('44444444-5555-4444-aaaa-000000000005',
	 'Logística Darién Segura',
	 'Darién Segura',
	 'Logística Darién Segura, S.A.',
	 '845-110-221',
	 '10',
	 '8-NT-006543',
	 'Darién',
	 'La Palma',
	 'La Palma',
	 'public',
	 'rh@dariensegura.gob.pa',
	 '+507 941-5500',
	 'Puerto de La Palma, Darién'),

	('44444444-6666-4444-aaaa-000000000006',
	 'Energía Bocas del Toro',
	 'Energía Bocas',
	 'Energía Renovable Bocas, S.A.',
	 '956-778-665',
	 '09',
	 '8-NT-006890',
	 'Bocas del Toro',
	 'Bocas del Toro',
	 'Isla Colón',
	 'public',
	 'empleos@energiabocas.gob.pa',
	 '+507 6901-7788',
	 'Isla Colón, Bocas del Toro');

-- ============================================================
-- Contratos digitales
-- Simulación de contratos de peaje por interacción
-- Incluye:
--  - ITBMS (7%) conforme a Panamá
--  - Facturación mensual emulada tipo DGI
--  - Contrato en HTML + JSON
-- ============================================================
INSERT INTO company_contracts (
	company_id, accepted, accepted_at, toll_description, toll_usd_per_interaction,
	interaction_definition, billing_terms, contract_html, contract_json, contract_version
) VALUES
	('11111111-1111-1111-1111-111111111111', 0, NULL,
	 'Peaje USD 0.25 + ITBMS 7% por interacción.', 0.25,
	 'Acceso web a vacante, chat con chatbot, visualización de detalle.',
	 'Facturación mensual emulada DGI Panamá. Pago contra factura HTML.',
	 '<p>Contrato digital Tech Chiriquí - peaje USD 0.25 + ITBMS 7%.</p>',
	 JSON_OBJECT('version', 'seed', 'currency', 'USD', 'peaje', 0.25, 'itbms', 0.07),
	 'v1-panama')
ON DUPLICATE KEY UPDATE
	toll_description=VALUES(toll_description),
	toll_usd_per_interaction=VALUES(toll_usd_per_interaction);

-- (Los demás contratos se mantienen EXACTAMENTE IGUAL)
INSERT INTO company_contracts (
	company_id, accepted, accepted_at, toll_description, toll_usd_per_interaction,
	interaction_definition, billing_terms, contract_html, contract_json, contract_version
) VALUES
	('22222222-2222-2222-2222-222222222222', 0, NULL, 'Peaje USD 0.30 + ITBMS 7% por interacción.', 0.30,
	 'Acceso web a vacante, chat con chatbot, visualización de detalle.',
	 'Facturación mensual emulada DGI Panamá. Pago contra factura HTML.',
	 '<p>Contrato digital Transporte del Istmo - peaje USD 0.30 + ITBMS 7%.</p>',
	 JSON_OBJECT('version', 'seed', 'currency', 'USD', 'peaje', 0.30, 'itbms', 0.07),
	 'v1-panama')
ON DUPLICATE KEY UPDATE toll_description=VALUES(toll_description), toll_usd_per_interaction=VALUES(toll_usd_per_interaction);

INSERT INTO company_contracts (
	company_id, accepted, accepted_at, toll_description, toll_usd_per_interaction,
	interaction_definition, billing_terms, contract_html, contract_json, contract_version
) VALUES
	('33333333-3333-3333-3333-333333333333', 0, NULL, 'Peaje USD 0.22 + ITBMS 7% por interacción.', 0.22,
	 'Acceso web a vacante, chat con chatbot, visualización de detalle.',
	 'Facturación mensual emulada DGI Panamá. Pago contra factura HTML.',
	 '<p>Contrato digital Agro Veraguas - peaje USD 0.22 + ITBMS 7%.</p>',
	 JSON_OBJECT('version', 'seed', 'currency', 'USD', 'peaje', 0.22, 'itbms', 0.07),
	 'v1-panama')
ON DUPLICATE KEY UPDATE toll_description=VALUES(toll_description), toll_usd_per_interaction=VALUES(toll_usd_per_interaction);

INSERT INTO company_contracts (
	company_id, accepted, accepted_at, toll_description, toll_usd_per_interaction,
	interaction_definition, billing_terms, contract_html, contract_json, contract_version
) VALUES
	('44444444-1111-4444-aaaa-000000000001', 0, NULL, 'Peaje USD 0.24 + ITBMS 7% por interacción.', 0.24,
	 'Acceso web a vacante, chat con chatbot, visualización de detalle.',
	 'Facturación mensual emulada DGI Panamá. Pago contra factura HTML.',
	 '<p>Contrato digital Canal Data Labs - peaje USD 0.24 + ITBMS 7%.</p>',
	 JSON_OBJECT('version', 'seed', 'currency', 'USD', 'peaje', 0.24, 'itbms', 0.07),
	 'v1-panama')
ON DUPLICATE KEY UPDATE toll_description=VALUES(toll_description), toll_usd_per_interaction=VALUES(toll_usd_per_interaction);

INSERT INTO company_contracts (
	company_id, accepted, accepted_at, toll_description, toll_usd_per_interaction,
	interaction_definition, billing_terms, contract_html, contract_json, contract_version
) VALUES
	('44444444-2222-4444-aaaa-000000000002', 0, NULL, 'Peaje USD 0.20 + ITBMS 7% por interacción.', 0.20,
	 'Acceso web a vacante, chat con chatbot, visualización de detalle.',
	 'Facturación mensual emulada DGI Panamá. Pago contra factura HTML.',
	 '<p>Contrato digital Salud Herrera Pública - peaje USD 0.20 + ITBMS 7%.</p>',
	 JSON_OBJECT('version', 'seed', 'currency', 'USD', 'peaje', 0.20, 'itbms', 0.07),
	 'v1-panama')
ON DUPLICATE KEY UPDATE toll_description=VALUES(toll_description), toll_usd_per_interaction=VALUES(toll_usd_per_interaction);

INSERT INTO company_contracts (
	company_id, accepted, accepted_at, toll_description, toll_usd_per_interaction,
	interaction_definition, billing_terms, contract_html, contract_json, contract_version
) VALUES
	('44444444-3333-4444-aaaa-000000000003', 0, NULL, 'Peaje USD 0.23 + ITBMS 7% por interacción.', 0.23,
	 'Acceso web a vacante, chat con chatbot, visualización de detalle.',
	 'Facturación mensual emulada DGI Panamá. Pago contra factura HTML.',
	 '<p>Contrato digital Turismo Los Santos - peaje USD 0.23 + ITBMS 7%.</p>',
	 JSON_OBJECT('version', 'seed', 'currency', 'USD', 'peaje', 0.23, 'itbms', 0.07),
	 'v1-panama')
ON DUPLICATE KEY UPDATE toll_description=VALUES(toll_description), toll_usd_per_interaction=VALUES(toll_usd_per_interaction);

INSERT INTO company_contracts (
	company_id, accepted, accepted_at, toll_description, toll_usd_per_interaction,
	interaction_definition, billing_terms, contract_html, contract_json, contract_version
) VALUES
	('44444444-4444-4444-aaaa-000000000004', 0, NULL, 'Peaje USD 0.21 + ITBMS 7% por interacción.', 0.21,
	 'Acceso web a vacante, chat con chatbot, visualización de detalle.',
	 'Facturación mensual emulada DGI Panamá. Pago contra factura HTML.',
	 '<p>Contrato digital Agro Coclé Verde - peaje USD 0.21 + ITBMS 7%.</p>',
	 JSON_OBJECT('version', 'seed', 'currency', 'USD', 'peaje', 0.21, 'itbms', 0.07),
	 'v1-panama')
ON DUPLICATE KEY UPDATE toll_description=VALUES(toll_description), toll_usd_per_interaction=VALUES(toll_usd_per_interaction);

INSERT INTO company_contracts (
	company_id, accepted, accepted_at, toll_description, toll_usd_per_interaction,
	interaction_definition, billing_terms, contract_html, contract_json, contract_version
) VALUES
	('44444444-5555-4444-aaaa-000000000005', 0, NULL, 'Peaje USD 0.26 + ITBMS 7% por interacción.', 0.26,
	 'Acceso web a vacante, chat con chatbot, visualización de detalle.',
	 'Facturación mensual emulada DGI Panamá. Pago contra factura HTML.',
	 '<p>Contrato digital Logística Darién Segura - peaje USD 0.26 + ITBMS 7%.</p>',
	 JSON_OBJECT('version', 'seed', 'currency', 'USD', 'peaje', 0.26, 'itbms', 0.07),
	 'v1-panama')
ON DUPLICATE KEY UPDATE toll_description=VALUES(toll_description), toll_usd_per_interaction=VALUES(toll_usd_per_interaction);

INSERT INTO company_contracts (
	company_id, accepted, accepted_at, toll_description, toll_usd_per_interaction,
	interaction_definition, billing_terms, contract_html, contract_json, contract_version
) VALUES
	('44444444-6666-4444-aaaa-000000000006', 0, NULL, 'Peaje USD 0.25 + ITBMS 7% por interacción.', 0.25,
	 'Acceso web a vacante, chat con chatbot, visualización de detalle.',
	 'Facturación mensual emulada DGI Panamá. Pago contra factura HTML.',
	 '<p>Contrato digital Energía Bocas del Toro - peaje USD 0.25 + ITBMS 7%.</p>',
	 JSON_OBJECT('version', 'seed', 'currency', 'USD', 'peaje', 0.25, 'itbms', 0.07),
	 'v1-panama')
ON DUPLICATE KEY UPDATE toll_description=VALUES(toll_description), toll_usd_per_interaction=VALUES(toll_usd_per_interaction);

-- ============================================================
-- Vacantes
-- Accesos a estas vacantes generan interacciones (peaje)
-- ============================================================
INSERT IGNORE INTO vacancies (id, company_id, title, description, location, salary, status) VALUES
	('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Analista de Datos (Chiriquí)', 'Modelos de demanda y tableros para operaciones logísticas.', 'David, Chiriquí', 'USD 1,200', 'open'),
	('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'Administrador de Contratos', 'Gestión de contratos y licitaciones para transporte público.', 'Panamá Oeste', 'USD 1,450', 'open'),
	('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'Especialista de Talento', 'Reclutamiento para fincas y plantas de empaque.', 'Santiago, Veraguas', 'USD 1,000', 'open'),
	('77777777-1111-4444-aaaa-000000000001', '44444444-1111-4444-aaaa-000000000001', 'Ingeniero de Datos Senior', 'Pipelines y tableros para logística en Colón.', 'Colón, Colón', 'USD 1,800', 'open'),
	('77777777-2222-4444-aaaa-000000000002', '44444444-2222-4444-aaaa-000000000002', 'Médico General APS', 'Atención primaria y coordinación con especialistas.', 'Chitré, Herrera', 'USD 2,100', 'open'),
	('77777777-3333-4444-aaaa-000000000003', '44444444-3333-4444-aaaa-000000000003', 'Coordinador de Turismo', 'Gestión de rutas y experiencias turísticas locales.', 'Las Tablas, Los Santos', 'USD 1,150', 'open'),
	('77777777-4444-4444-aaaa-000000000004', '44444444-4444-4444-aaaa-000000000004', 'Supervisor Agroindustrial', 'Supervisión de planta empacadora y cadena fría.', 'Penonomé, Coclé', 'USD 1,050', 'open'),
	('77777777-5555-4444-aaaa-000000000005', '44444444-5555-4444-aaaa-000000000005', 'Operador Logístico', 'Operaciones de puerto y despacho terrestre.', 'La Palma, Darién', 'USD 1,000', 'open'),
	('77777777-6666-4444-aaaa-000000000006', '44444444-6666-4444-aaaa-000000000006', 'Técnico Eléctrico', 'Mantenimiento de microred y paneles solares.', 'Isla Colón, Bocas del Toro', 'USD 1,200', 'open');

-- ============================================================
-- Interacciones (incluye company_id para trazabilidad)
-- ============================================================
INSERT IGNORE INTO interactions (id, vacancy_id, company_id, channel, event, created_at) VALUES
	('77777777-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'web', 'view', NOW() - INTERVAL 2 DAY),
	('88888888-8888-8888-8888-888888888888', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'chatbot', 'chat', NOW() - INTERVAL 1 DAY),
	('99999999-9999-9999-9999-999999999999', '55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'web', 'view', NOW() - INTERVAL 3 DAY),
	('aaaa9999-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'web', 'view', NOW() - INTERVAL 1 DAY),
	('bbbb9999-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'web', 'view', NOW() - INTERVAL 1 DAY),
	('cccc9999-cccc-cccc-cccc-cccccccccccc', '66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'web', 'view', NOW()),
	('dddd9999-dddd-cccc-cccc-cccccccccccc', '77777777-1111-4444-aaaa-000000000001', '44444444-1111-4444-aaaa-000000000001', 'web', 'view', NOW() - INTERVAL 1 DAY),
	('eeee9999-eeee-cccc-cccc-cccccccccccc', '77777777-1111-4444-aaaa-000000000001', '44444444-1111-4444-aaaa-000000000001', 'chatbot', 'chat', NOW() - INTERVAL 12 HOUR),
	('ffff9999-ffff-cccc-cccc-cccccccccccc', '77777777-2222-4444-aaaa-000000000002', '44444444-2222-4444-aaaa-000000000002', 'web', 'view', NOW() - INTERVAL 2 DAY),
	('11119999-aaaa-cccc-cccc-cccccccccccc', '77777777-3333-4444-aaaa-000000000003', '44444444-3333-4444-aaaa-000000000003', 'web', 'view', NOW() - INTERVAL 3 DAY),
	('22229999-aaaa-cccc-cccc-cccccccccccc', '77777777-4444-4444-aaaa-000000000004', '44444444-4444-4444-aaaa-000000000004', 'web', 'view', NOW() - INTERVAL 1 DAY),
	('33339999-aaaa-cccc-cccc-cccccccccccc', '77777777-5555-4444-aaaa-000000000005', '44444444-5555-4444-aaaa-000000000005', 'web', 'view', NOW() - INTERVAL 2 DAY),
	('44449999-aaaa-cccc-cccc-cccccccccccc', '77777777-6666-4444-aaaa-000000000006', '44444444-6666-4444-aaaa-000000000006', 'web', 'view', NOW() - INTERVAL 1 DAY);
