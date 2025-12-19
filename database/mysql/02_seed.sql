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
	('33333333-aaaa-bbbb-cccc-000000000006', 'empresa_bocas', '$2b$10$sSh4uwjGMZ7hlYaq5/LSQeaUoVTdvkB4LRgt/O.BWpEAGEryFPjse', 'empresa', '44444444-6666-4444-aaaa-000000000006'),
	('44444444-aaaa-bbbb-cccc-000000000007', 'empresa_veraguas', '$2b$10$sSh4uwjGMZ7hlYaq5/LSQeaUoVTdvkB4LRgt/O.BWpEAGEryFPjse', 'empresa', '44444444-7777-4444-aaaa-000000000007'),
	('55555555-aaaa-bbbb-cccc-000000000008', 'empresa_panama_este', '$2b$10$sSh4uwjGMZ7hlYaq5/LSQeaUoVTdvkB4LRgt/O.BWpEAGEryFPjse', 'empresa', '44444444-0008-4444-aaaa-000000000108'),
	('66666666-aaaa-bbbb-cccc-000000000009', 'empresa_gnobe_bugle', '$2b$10$sSh4uwjGMZ7hlYaq5/LSQeaUoVTdvkB4LRgt/O.BWpEAGEryFPjse', 'empresa', '44444444-9999-4444-aaaa-000000000009'),
	('77777777-aaaa-bbbb-cccc-000000000010', 'empresa_embuera', '$2b$10$sSh4uwjGMZ7hlYaq5/LSQeaUoVTdvkB4LRgt/O.BWpEAGEryFPjse', 'empresa', '44444444-0001-4444-aaaa-000000000010'),
	('88888888-aaaa-bbbb-cccc-000000000011', 'empresa_wargandi', '$2b$10$sSh4uwjGMZ7hlYaq5/LSQeaUoVTdvkB4LRgt/O.BWpEAGEryFPjse', 'empresa', '44444444-0002-4444-aaaa-000000000011'),
	('99999999-aaaa-bbbb-cccc-000000000012', 'empresa_madungandi', '$2b$10$sSh4uwjGMZ7hlYaq5/LSQeaUoVTdvkB4LRgt/O.BWpEAGEryFPjse', 'empresa', '44444444-0003-4444-aaaa-000000000012');

-- Continuación de usuarios (agregando más usuarios para las nuevas empresas)
INSERT IGNORE INTO users (id, username, password_hash, role, company_id) VALUES
	('aaaaaaaa-bbbb-cccc-dddd-000000000013', 'empresa_comarca_1', '$2b$10$sSh4uwjGMZ7hlYaq5/LSQeaUoVTdvkB4LRgt/O.BWpEAGEryFPjse', 'empresa', '44444444-0004-4444-aaaa-000000000013'),
	('bbbbbbbb-cccc-dddd-eeee-000000000014', 'empresa_comarca_2', '$2b$10$sSh4uwjGMZ7hlYaq5/LSQeaUoVTdvkB4LRgt/O.BWpEAGEryFPjse', 'empresa', '44444444-0005-4444-aaaa-000000000014'),
	('cccccccc-dddd-eeee-ffff-000000000015', 'empresa_comarca_3', '$2b$10$sSh4uwjGMZ7hlYaq5/LSQeaUoVTdvkB4LRgt/O.BWpEAGEryFPjse', 'empresa', '44444444-0006-4444-aaaa-000000000106');

-- ============================================================
-- 50 EMPRESAS REGISTRADAS EN PANAMÁ
-- Todas las provincias y comarcas de Panamá
-- ============================================================

-- 1-10: Chiriquí (Provincia)
INSERT IGNORE INTO companies (
	id, name, commercial_name, legal_name, ruc, dv, nit,
	province, district, corregimiento, type, email, phone, address
) VALUES
	('11111111-1111-1111-1111-111111111111',
	 'Tech Chiriquí',
	 'Tech Chiriquí',
	 'Tech Chiriquí S.A.',
	 '155-789-456', '82', '8-NT-001234',
	 'Chiriquí', 'David', 'David', 'private',
	 'contacto@techchiriqui.pa', '+507 6300-1101', 'Zona Franca, David, Chiriquí'),

	('22222222-2222-2222-2222-222222222222',
	 'Café de Altura Chiriquí',
	 'Café Chiriquí Premium',
	 'Café de Altura Chiriquí, S.A.',
	 '155-120-789', '15', '8-NT-001235',
	 'Chiriquí', 'Boquete', 'Boquete', 'private',
	 'ventas@cafechiriqui.pa', '+507 7200-2202', 'Finca El Paraíso, Boquete'),

	('33333333-3333-3333-3333-333333333333',
	 'Hospital Regional de Chiriquí',
	 'Hospital Chiriquí',
	 'Hospital Regional de Chiriquí',
	 '155-456-123', '07', '8-NT-001236',
	 'Chiriquí', 'David', 'Río Grande', 'public',
	 'admin@hospitalchiriqui.gob.pa', '+507 775-0101', 'Vía Interamericana, David'),

	('44444444-0001-4444-aaaa-000000000101',
	 'Agroexportadora Volcánica',
	 'AgroVolcán',
	 'Agroexportadora Volcánica, S.A.',
	 '155-333-444', '12', '8-NT-001237',
	 'Chiriquí', 'Volcán', 'Volcán', 'private',
	 'export@agrovolcan.pa', '+507 7712-3344', 'Finca Volcánica, Tierras Altas'),

	('44444444-0002-4444-aaaa-000000000102',
	 'Logística Fronteriza Chiricana',
	 'Logística Frontera',
	 'Logística Fronteriza Chiricana, S.A.',
	 '155-777-888', '19', '8-NT-001238',
	 'Chiriquí', 'Paso Canoas', 'Paso Canoas', 'private',
	 'logistica@fronteriza.pa', '+507 7201-8899', 'Frontera con Costa Rica, Paso Canoas');

-- 11-20: Panamá (Provincia Metropolitana)
INSERT IGNORE INTO companies (
	id, name, commercial_name, legal_name, ruc, dv, nit,
	province, district, corregimiento, type, email, phone, address
) VALUES
	('44444444-0003-4444-aaaa-000000000103',
	 'Transporte Canal',
	 'Transporte Canal',
	 'Transporte del Istmo, S.A.',
	 '230-456-789', '15', '8-NT-002345',
	 'Panamá', 'Panamá', 'San Francisco', 'public',
	 'rrhh@transporte.pa', '+507 398-0002', 'Calle 50, San Francisco, Panamá'),

	('44444444-0004-4444-aaaa-000000000104',
	 'Banco Capital Financiero',
	 'Banco Capital',
	 'Banco Capital Financiero Internacional, S.A.',
	 '230-123-456', '22', '8-NT-002346',
	 'Panamá', 'Panamá', 'Bella Vista', 'private',
	 'servicio@bancocapital.pa', '+507 206-7000', 'Torre Bancaria, Calle 50'),

	('44444444-0005-4444-aaaa-000000000105',
	 'Seguros del Istmo',
	 'Seguros Istmeños',
	 'Seguros del Istmo, S.A.',
	 '230-789-012', '08', '8-NT-002347',
	 'Panamá', 'Panamá', 'Punta Pacífica', 'private',
	 'clientes@segurosistmo.pa', '+507 380-5555', 'Costa del Este, Panamá'),

	('44444444-0006-4444-aaaa-000000000106',
	 'Centro Médico Paitilla',
	 'Hospital Paitilla',
	 'Centro Médico Paitilla, S.A.',
	 '230-456-789', '33', '8-NT-002348',
	 'Panamá', 'Panamá', 'San Francisco', 'private',
	 'info@paitilla.pa', '+507 265-8800', 'Vía Italia, San Francisco'),

	('44444444-0007-4444-aaaa-000000000107',
	 'Universidad Tecnológica',
	 'UTP Panamá',
	 'Universidad Tecnológica de Panamá',
	 '230-999-888', '17', '8-NT-002349',
	 'Panamá', 'Panamá', 'Betania', 'public',
	 'admision@utp.ac.pa', '+507 560-3000', 'Campus Central, Vía Centenario');

-- 21-25: Panamá Oeste
INSERT IGNORE INTO companies (
	id, name, commercial_name, legal_name, ruc, dv, nit,
	province, district, corregimiento, type, email, phone, address
) VALUES
	('44444444-0008-4444-aaaa-000000000108',
	 'Constructoras del Pacífico',
	 'Constrúpac',
	 'Constructoras del Pacífico, S.A.',
	 '240-111-222', '25', '8-NT-002350',
	 'Panamá Oeste', 'La Chorrera', 'La Chorrera', 'private',
	 'proyectos@constrúpac.pa', '+507 240-1000', 'Vía Interamericana, La Chorrera'),

	('44444444-0009-4444-aaaa-000000000109',
	 'Plaza Comercial Oeste',
	 'Plaza Oeste Mall',
	 'Centro Comercial Plaza Oeste, S.A.',
	 '240-333-444', '11', '8-NT-002351',
	 'Panamá Oeste', 'Arraiján', 'Burunga', 'private',
	 'administracion@plazaoste.pa', '+507 345-6789', 'Vía Interamericana, Arraiján'),

	('44444444-0010-4444-aaaa-000000000110',
	 'Hospital Nicolás Solano',
	 'Hospital Solano',
	 'Hospital Nicolás A. Solano',
	 '240-555-666', '09', '8-NT-002352',
	 'Panamá Oeste', 'La Chorrera', 'La Chorrera', 'public',
	 'contacto@hospitalsolano.gob.pa', '+507 254-7000', 'La Chorrera, Panamá Oeste');

-- 26-30: Colón
INSERT IGNORE INTO companies (
	id, name, commercial_name, legal_name, ruc, dv, nit,
	province, district, corregimiento, type, email, phone, address
) VALUES
	('44444444-1111-4444-aaaa-000000000001',
	 'Canal Data Labs',
	 'Canal Data Labs',
	 'Canal Data Labs, S.A.',
	 '401-889-120', '18', '8-NT-004567',
	 'Colón', 'Colón', 'Barrio Norte', 'private',
	 'info@canaldatalabs.pa', '+507 448-1010', 'Zona Libre de Colón, Colón'),

	('44444444-0011-4444-aaaa-000000000111',
	 'Zona Libre de Colón',
	 'ZLC Trading',
	 'Zona Libre de Colón, S.A.',
	 '401-222-333', '44', '8-NT-004568',
	 'Colón', 'Colón', 'Cristóbal', 'public',
	 'info@zonafreecolon.pa', '+507 441-6000', 'Zona Libre, Colón'),

	('44444444-0012-4444-aaaa-000000000112',
	 'Puerto de Manzanillo',
	 'MIT Manzanillo',
	 'Manzanillo International Terminal',
	 '401-444-555', '27', '8-NT-004569',
	 'Colón', 'Colón', 'Cativá', 'private',
	 'operaciones@mitpanama.pa', '+507 433-6000', 'Cativá, Colón');

-- 31-35: Veraguas
INSERT IGNORE INTO companies (
	id, name, commercial_name, legal_name, ruc, dv, nit,
	province, district, corregimiento, type, email, phone, address
) VALUES
	('44444444-7777-4444-aaaa-000000000007',
	 'Agro Veraguas',
	 'Agro Veraguas',
	 'Agro Veraguas Holdings, S.A.',
	 '045-120-999', '07', '8-NT-003456',
	 'Veraguas', 'Santiago', 'Santiago', 'private',
	 'talento@agroveraguas.pa', '+507 940-2211', 'Vía Interamericana, Santiago, Veraguas'),

	('44444444-0013-4444-aaaa-000000000113',
	 'Universidad de Veraguas',
	 'UDV',
	 'Universidad de Veraguas',
	 '045-777-888', '19', '8-NT-003457',
	 'Veraguas', 'Santiago', 'Santiago', 'public',
	 'admision@udv.ac.pa', '+507 998-2200', 'Campus Central, Santiago'),

	('44444444-0014-4444-aaaa-000000000114',
	 'Minera Cerro Colorado',
	 'Minera Veraguas',
	 'Minera Cerro Colorado, S.A.',
	 '045-555-666', '31', '8-NT-003458',
	 'Veraguas', 'Cañazas', 'Cañazas', 'private',
	 'empleos@mineracc.pa', '+507 901-3344', 'Cerro Colorado, Veraguas');

-- 36-40: Herrera
INSERT IGNORE INTO companies (
	id, name, commercial_name, legal_name, ruc, dv, nit,
	province, district, corregimiento, type, email, phone, address
) VALUES
	('44444444-2222-4444-aaaa-000000000002',
	 'Salud Herrera Pública',
	 'Salud Herrera',
	 'Caja Provincial de Salud Herrera',
	 '512-330-777', '06', '8-NT-004890',
	 'Herrera', 'Chitré', 'Monagrillo', 'public',
	 'contacto@saludherrera.gob.pa', '+507 978-2202', 'Avenida Herrera, Chitré, Herrera'),

	('44444444-0015-4444-aaaa-000000000115',
	 'Carnicería Herrera',
	 'Carnes Herrera',
	 'Empacadora de Carnes Herrera, S.A.',
	 '512-111-222', '23', '8-NT-004891',
	 'Herrera', 'Chitré', 'La Arena', 'private',
	 'ventas@carnesherrera.pa', '+507 996-1122', 'La Arena, Herrera'),

	('44444444-0016-4444-aaaa-000000000116',
	 'Banco Agropecuario Herrera',
	 'Banco AgroHerrera',
	 'Banco Agropecuario de Herrera, S.A.',
	 '512-444-555', '14', '8-NT-004892',
	 'Herrera', 'Los Pozos', 'Los Pozos', 'private',
	 'clientes@bancoagroherrera.pa', '+507 987-6655', 'Los Pozos, Herrera');

-- 41-45: Los Santos
INSERT IGNORE INTO companies (
	id, name, commercial_name, legal_name, ruc, dv, nit,
	province, district, corregimiento, type, email, phone, address
) VALUES
	('44444444-3333-4444-aaaa-000000000003',
	 'Turismo Los Santos',
	 'Turismo Los Santos',
	 'Operadora Turística Santeña, S.A.',
	 '623-455-332', '11', '8-NT-005321',
	 'Los Santos', 'Las Tablas', 'Guararé', 'private',
	 'talento@turismosantos.pa', '+507 925-1144', 'Vía Playa El Uverito, Las Tablas, Los Santos'),

	('44444444-0017-4444-aaaa-000000000117',
	 'Festival de la Pollera',
	 'Pollera de Oro',
	 'Fundación Festival de la Pollera',
	 '623-666-777', '08', '8-NT-005322',
	 'Los Santos', 'Las Tablas', 'Las Tablas', 'public',
	 'info@festivalpollera.pa', '+507 994-5566', 'Las Tablas, Los Santos'),

	('44444444-0018-4444-aaaa-000000000118',
	 'Quesos Santeños',
	 'Quesos Las Tablas',
	 'Lácteos Santeños, S.A.',
	 '623-888-999', '26', '8-NT-005323',
	 'Los Santos', 'Macaracas', 'Macaracas', 'private',
	 'ventas@quesossantenos.pa', '+507 920-7788', 'Macaracas, Los Santos');

-- 46-50: Coclé
INSERT IGNORE INTO companies (
	id, name, commercial_name, legal_name, ruc, dv, nit,
	province, district, corregimiento, type, email, phone, address
) VALUES
	('44444444-4444-4444-aaaa-000000000004',
	 'Agro Coclé Verde',
	 'Agro Coclé',
	 'Agro Coclé Verde, S.A.',
	 '734-210-998', '04', '8-NT-005876',
	 'Coclé', 'Penonomé', 'Penonomé', 'private',
	 'recursos@agrococle.pa', '+507 987-3311', 'Vía Interamericana, Penonomé, Coclé'),

	('44444444-0019-4444-aaaa-000000000119',
	 'Termas de Coclé',
	 'Aguas Termales',
	 'Termas de Coclé, S.A.',
	 '734-333-444', '17', '8-NT-005877',
	 'Coclé', 'Aguadulce', 'Aguadulce', 'private',
	 'reservas@termascocle.pa', '+507 997-8899', 'Aguadulce, Coclé'),

	('44444444-0020-4444-aaaa-000000000120',
	 'Hotel Playa Blanca',
	 'Playa Blanca Resort',
	 'Hotel Playa Blanca Coclé, S.A.',
	 '734-555-666', '29', '8-NT-005878',
	 'Coclé', 'Antón', 'Antón', 'private',
	 'reservas@playablancacocle.pa', '+507 240-5000', 'Playa Blanca, Coclé');

-- 51-55: Darién
INSERT IGNORE INTO companies (
	id, name, commercial_name, legal_name, ruc, dv, nit,
	province, district, corregimiento, type, email, phone, address
) VALUES
	('44444444-5555-4444-aaaa-000000000005',
	 'Logística Darién Segura',
	 'Darién Segura',
	 'Logística Darién Segura, S.A.',
	 '845-110-221', '10', '8-NT-006543',
	 'Darién', 'La Palma', 'La Palma', 'public',
	 'rh@dariensegura.gob.pa', '+507 941-5500', 'Puerto de La Palma, Darién'),

	('44444444-0021-4444-aaaa-000000000121',
	 'Parque Nacional Darién',
	 'Darién Protegido',
	 'Administración Parque Nacional Darién',
	 '845-222-333', '05', '8-NT-006544',
	 'Darién', 'Chepigana', 'Garachiné', 'public',
	 'info@parquedarien.gob.pa', '+507 299-1122', 'Garachiné, Darién'),

	('44444444-0022-4444-aaaa-000000000122',
	 'Maderas Darién',
	 'Maderas del Este',
	 'Maderas Darién Sostenible, S.A.',
	 '845-444-555', '21', '8-NT-006545',
	 'Darién', 'Pinogana', 'El Real de Santa María', 'private',
	 'ventas@maderasdarien.pa', '+507 299-3344', 'El Real, Darién');

-- 56-60: Bocas del Toro
INSERT IGNORE INTO companies (
	id, name, commercial_name, legal_name, ruc, dv, nit,
	province, district, corregimiento, type, email, phone, address
) VALUES
	('44444444-6666-4444-aaaa-000000000006',
	 'Energía Bocas del Toro',
	 'Energía Bocas',
	 'Energía Renovable Bocas, S.A.',
	 '956-778-665', '09', '8-NT-006890',
	 'Bocas del Toro', 'Bocas del Toro', 'Isla Colón', 'public',
	 'empleos@energiabocas.gob.pa', '+507 6901-7788', 'Isla Colón, Bocas del Toro'),

	('44444444-0023-4444-aaaa-000000000123',
	 'Tour Bocatorrense',
	 'Bocas Tours',
	 'Tour Operadora Bocatorrense, S.A.',
	 '956-111-222', '16', '8-NT-006891',
	 'Bocas del Toro', 'Bocas del Toro', 'Bocas del Toro', 'private',
	 'ventas@bocastours.pa', '+507 757-9988', 'Calle 3ra, Isla Colón'),

	('44444444-0024-4444-aaaa-000000000124',
	 'Plátano Bocas',
	 'Exportadora Bocas',
	 'Exportadora de Plátano Bocas, S.A.',
	 '956-333-444', '28', '8-NT-006892',
	 'Bocas del Toro', 'Changuinola', 'Changuinola', 'private',
	 'export@platanobocas.pa', '+507 758-6677', 'Changuinola, Bocas del Toro');

-- 61-65: Comarca Ngäbe-Buglé
INSERT IGNORE INTO companies (
	id, name, commercial_name, legal_name, ruc, dv, nit,
	province, district, corregimiento, type, email, phone, address
) VALUES
	('44444444-9999-4444-aaaa-000000000009',
	 'Artesanías Ngäbe',
	 'Artesanía Indígena',
	 'Cooperativa Artesanal Ngäbe-Buglé',
	 '760-123-456', '13', '8-NT-007123',
	 'Ngäbe-Buglé', 'Müna', 'Hato Chamí', 'public',
	 'artesania@ngabebugle.gob.pa', '+507 652-3344', 'Hato Chamí, Comarca Ngäbe-Buglé'),

	('44444444-0025-4444-aaaa-000000000125',
	 'Café de Altura Ngäbe',
	 'Café Ngäbe',
	 'Cooperativa Cafetalera Ngäbe',
	 '760-555-666', '07', '8-NT-007124',
	 'Ngäbe-Buglé', 'Kankintú', 'Kusapín', 'private',
	 'cafe@ngabebugle.pa', '+507 653-4455', 'Kusapín, Comarca Ngäbe-Buglé');

-- 66-70: Comarca Emberá-Wounaan
INSERT IGNORE INTO companies (
	id, name, commercial_name, legal_name, ruc, dv, nit,
	province, district, corregimiento, type, email, phone, address
) VALUES
	('44444444-0001-4444-aaaa-000000000010',
	 'Turismo Emberá',
	 'Emberá Tours',
	 'Comunidad Turística Emberá',
	 '770-777-888', '19', '8-NT-007234',
	 'Emberá-Wounaan', 'Cémaco', 'Unión Chocó', 'public',
	 'turismo@embera.gob.pa', '+507 299-5566', 'Río Chucunaque, Darién'),

	('44444444-0026-4444-aaaa-000000000126',
	 'Artesanía Wounaan',
	 'Cestería Wounaan',
	 'Cooperativa Artesanal Wounaan',
	 '770-999-000', '24', '8-NT-007235',
	 'Emberá-Wounaan', 'Sambú', 'Sambú', 'private',
	 'ventas@artesaniawounaan.pa', '+507 299-6677', 'Sambú, Comarca Emberá');

-- 71-75: Comarca Guna Yala
INSERT IGNORE INTO companies (
	id, name, commercial_name, legal_name, ruc, dv, nit,
	province, district, corregimiento, type, email, phone, address
) VALUES
	('44444444-0002-4444-aaaa-000000000011',
	 'Turismo Guna Yala',
	 'San Blas Adventures',
	 'Consejo Turístico Guna Yala',
	 '780-111-222', '08', '8-NT-007345',
	 'Guna Yala', 'Guna Yala', 'Ailigandí', 'public',
	 'info@gunayala.gob.pa', '+507 6001-2233', 'Ailigandí, Guna Yala'),

	('44444444-0027-4444-aaaa-000000000127',
	 'Molas Guna',
	 'Artesanía Guna',
	 'Cooperativa de Molas Guna Yala',
	 '780-333-444', '32', '8-NT-007346',
	 'Guna Yala', 'Guna Yala', 'Cartí Sugtupu', 'private',
	 'molas@gunayala.pa', '+507 6001-4455', 'Cartí, Guna Yala');

-- 76-80: Comarca Madungandí
INSERT IGNORE INTO companies (
	id, name, commercial_name, legal_name, ruc, dv, nit,
	province, district, corregimiento, type, email, phone, address
) VALUES
	('44444444-0003-4444-aaaa-000000000012',
	 'Ecoturismo Madungandí',
	 'Madungandí Natural',
	 'Consejo Ecoturístico Madungandí',
	 '790-555-666', '11', '8-NT-007456',
	 'Madungandí', 'Madungandí', 'Ipetí', 'public',
	 'turismo@madungandi.gob.pa', '+507 299-7788', 'Ipetí, Comarca Madungandí');

-- 81-85: Comarca Wargandí
INSERT IGNORE INTO companies (
	id, name, commercial_name, legal_name, ruc, dv, nit,
	province, district, corregimiento, type, email, phone, address
) VALUES
	('44444444-0004-4444-aaaa-000000000013',
	 'Café Wargandí',
	 'Café de la Montaña',
	 'Cooperativa Cafetalera Wargandí',
	 '795-777-888', '26', '8-NT-007567',
	 'Wargandí', 'Wargandí', 'Nurra', 'public',
	 'cafe@wargandi.gob.pa', '+507 652-8899', 'Nurra, Comarca Wargandí');

-- 86-90: Empresas Nacionales (sede en Panamá, operación nacional)
INSERT IGNORE INTO companies (
	id, name, commercial_name, legal_name, ruc, dv, nit,
	province, district, corregimiento, type, email, phone, address
) VALUES
	('44444444-0005-4444-aaaa-000000000014',
	 'Cervecería Nacional',
	 'Cerveza Panamá',
	 'Cervecería Nacional, S.A.',
	 '230-888-999', '45', '8-NT-008901',
	 'Panamá', 'Panamá', 'Ancón', 'private',
	 'empleo@cervecerianacional.pa', '+507 228-1000', 'Vía Transístmica, Ancón'),

	('44444444-0028-4444-aaaa-000000000128',
	 'Supermercados Rey',
	 'Super Rey',
	 'Supermercados Rey, S.A.',
	 '230-444-555', '37', '8-NT-008902',
	 'Panamá', 'Panamá', 'Bella Vista', 'private',
	 'rrhh@superrey.pa', '+507 206-2000', 'Vía España, Panamá');

-- 91-95: Sector Público Nacional
INSERT IGNORE INTO companies (
	id, name, commercial_name, legal_name, ruc, dv, nit,
	province, district, corregimiento, type, email, phone, address
) VALUES
	('44444444-0029-4444-aaaa-000000000129',
	 'Ministerio de Salud',
	 'MINSA Panamá',
	 'Ministerio de Salud de Panamá',
	 '000-111-222', '01', '8-NT-009001',
	 'Panamá', 'Panamá', 'Bethania', 'public',
	 'talentohumano@minsa.gob.pa', '+507 512-9000', 'Avenida Cuba, Panamá'),

	('44444444-0030-4444-aaaa-000000000130',
	 'Autoridad del Canal de Panamá',
	 'ACP',
	 'Autoridad del Canal de Panamá',
	 '000-333-444', '02', '8-NT-009002',
	 'Panamá', 'Panamá', 'Balboa', 'public',
	 'empleos@acp.gob.pa', '+507 276-5000', 'Edificio de la ACP, Balboa');

-- 96-100: Empresas de Servicios Especializados (últimas 5)
INSERT IGNORE INTO companies (
	id, name, commercial_name, legal_name, ruc, dv, nit,
	province, district, corregimiento, type, email, phone, address
) VALUES
	('44444444-0031-4444-aaaa-000000000131',
	 'Consultores Legales Istmeños',
	 'CLI Abogados',
	 'Consultores Legales Istmeños, S.A.',
	 '230-666-777', '41', '8-NT-009101',
	 'Panamá', 'Panamá', 'Obarrio', 'private',
	 'info@cli.pa', '+507 264-2000', 'Torre Global Bank, Obarrio'),

	('44444444-0032-4444-aaaa-000000000132',
	 'Auditores Panamá',
	 'Auditores Asociados',
	 'Auditores Panamá, S.A.',
	 '230-222-333', '39', '8-NT-009102',
	 'Panamá', 'Panamá', 'Punta Paitilla', 'private',
	 'contacto@auditorespa.pa', '+507 214-6000', 'Punta Paitilla, Panamá'),

	('44444444-0033-4444-aaaa-000000000133',
	 'Desarrollo Software Panamá',
	 'DevSoft PA',
	 'Desarrollo de Software Panamá, S.A.',
	 '230-999-000', '47', '8-NT-009103',
	 'Panamá', 'Panamá', 'Costa del Este', 'private',
	 'empleos@devsoftpa.pa', '+507 391-8000', 'Costa del Este, Panamá'),

	('44444444-0034-4444-aaaa-000000000134',
	 'Marketing Digital Centroamérica',
	 'MDC Agencia',
	 'Marketing Digital Centroamérica, S.A.',
	 '230-777-888', '43', '8-NT-009104',
	 'Panamá', 'Panamá', 'San Francisco', 'private',
	 'talent@mdc.pa', '+507 396-7000', 'San Francisco, Panamá'),

	('44444444-0035-4444-aaaa-000000000135',
	 'Logística Panamá Hub',
	 'Panamá Hub',
	 'Logística Panamá Hub, S.A.',
	 '230-555-444', '35', '8-NT-009105',
	 'Panamá', 'Panamá', 'Albrook', 'private',
	 'recursos@panamahub.pa', '+507 315-4000', 'Zona Libre de Albrook, Panamá');

-- ============================================================
-- CONTRATOS DIGITALES PARA LAS 50 EMPRESAS
-- (Simulación simplificada - solo algunas empresas tienen contratos)
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

-- Contratos para otras 19 empresas principales
INSERT INTO company_contracts (company_id, accepted, accepted_at, toll_description, toll_usd_per_interaction, interaction_definition, billing_terms, contract_html, contract_json, contract_version) VALUES
	('22222222-2222-2222-2222-222222222222', 0, NULL, 'Peaje USD 0.22 + ITBMS 7% por interacción.', 0.22, 'Acceso web a vacante, chat con chatbot, visualización de detalle.', 'Facturación mensual emulada DGI Panamá. Pago contra factura HTML.', '<p>Contrato Café Chiriquí - peaje USD 0.22 + ITBMS 7%.</p>', JSON_OBJECT('version', 'seed', 'currency', 'USD', 'peaje', 0.22, 'itbms', 0.07), 'v1-panama'),
	('33333333-3333-3333-3333-333333333333', 0, NULL, 'Peaje USD 0.20 + ITBMS 7% por interacción.', 0.20, 'Acceso web a vacante, chat con chatbot, visualización de detalle.', 'Facturación mensual emulada DGI Panamá. Pago contra factura HTML.', '<p>Contrato Hospital Chiriquí - peaje USD 0.20 + ITBMS 7%.</p>', JSON_OBJECT('version', 'seed', 'currency', 'USD', 'peaje', 0.20, 'itbms', 0.07), 'v1-panama'),
	('44444444-0003-4444-aaaa-000000000103', 0, NULL, 'Peaje USD 0.30 + ITBMS 7% por interacción.', 0.30, 'Acceso web a vacante, chat con chatbot, visualización de detalle.', 'Facturación mensual emulada DGI Panamá. Pago contra factura HTML.', '<p>Contrato Transporte Canal - peaje USD 0.30 + ITBMS 7%.</p>', JSON_OBJECT('version', 'seed', 'currency', 'USD', 'peaje', 0.30, 'itbms', 0.07), 'v1-panama'),
	('44444444-0004-4444-aaaa-000000000104', 0, NULL, 'Peaje USD 0.35 + ITBMS 7% por interacción.', 0.35, 'Acceso web a vacante, chat con chatbot, visualización de detalle.', 'Facturación mensual emulada DGI Panamá. Pago contra factura HTML.', '<p>Contrato Banco Capital - peaje USD 0.35 + ITBMS 7%.</p>', JSON_OBJECT('version', 'seed', 'currency', 'USD', 'peaje', 0.35, 'itbms', 0.07), 'v1-panama'),
	('44444444-1111-4444-aaaa-000000000001', 0, NULL, 'Peaje USD 0.24 + ITBMS 7% por interacción.', 0.24, 'Acceso web a vacante, chat con chatbot, visualización de detalle.', 'Facturación mensual emulada DGI Panamá. Pago contra factura HTML.', '<p>Contrato Canal Data Labs - peaje USD 0.24 + ITBMS 7%.</p>', JSON_OBJECT('version', 'seed', 'currency', 'USD', 'peaje', 0.24, 'itbms', 0.07), 'v1-panama'),
	('44444444-7777-4444-aaaa-000000000007', 0, NULL, 'Peaje USD 0.22 + ITBMS 7% por interacción.', 0.22, 'Acceso web a vacante, chat con chatbot, visualización de detalle.', 'Facturación mensual emulada DGI Panamá. Pago contra factura HTML.', '<p>Contrato Agro Veraguas - peaje USD 0.22 + ITBMS 7%.</p>', JSON_OBJECT('version', 'seed', 'currency', 'USD', 'peaje', 0.22, 'itbms', 0.07), 'v1-panama'),
	('44444444-2222-4444-aaaa-000000000002', 0, NULL, 'Peaje USD 0.20 + ITBMS 7% por interacción.', 0.20, 'Acceso web a vacante, chat con chatbot, visualización de detalle.', 'Facturación mensual emulada DGI Panamá. Pago contra factura HTML.', '<p>Contrato Salud Herrera - peaje USD 0.20 + ITBMS 7%.</p>', JSON_OBJECT('version', 'seed', 'currency', 'USD', 'peaje', 0.20, 'itbms', 0.07), 'v1-panama'),
	('44444444-3333-4444-aaaa-000000000003', 0, NULL, 'Peaje USD 0.23 + ITBMS 7% por interacción.', 0.23, 'Acceso web a vacante, chat con chatbot, visualización de detalle.', 'Facturación mensual emulada DGI Panamá. Pago contra factura HTML.', '<p>Contrato Turismo Los Santos - peaje USD 0.23 + ITBMS 7%.</p>', JSON_OBJECT('version', 'seed', 'currency', 'USD', 'peaje', 0.23, 'itbms', 0.07), 'v1-panama'),
	('44444444-4444-4444-aaaa-000000000004', 0, NULL, 'Peaje USD 0.21 + ITBMS 7% por interacción.', 0.21, 'Acceso web a vacante, chat con chatbot, visualización de detalle.', 'Facturación mensual emulada DGI Panamá. Pago contra factura HTML.', '<p>Contrato Agro Coclé - peaje USD 0.21 + ITBMS 7%.</p>', JSON_OBJECT('version', 'seed', 'currency', 'USD', 'peaje', 0.21, 'itbms', 0.07), 'v1-panama'),
	('44444444-5555-4444-aaaa-000000000005', 0, NULL, 'Peaje USD 0.26 + ITBMS 7% por interacción.', 0.26, 'Acceso web a vacante, chat con chatbot, visualización de detalle.', 'Facturación mensual emulada DGI Panamá. Pago contra factura HTML.', '<p>Contrato Logística Darién - peaje USD 0.26 + ITBMS 7%.</p>', JSON_OBJECT('version', 'seed', 'currency', 'USD', 'peaje', 0.26, 'itbms', 0.07), 'v1-panama'),
	('44444444-6666-4444-aaaa-000000000006', 0, NULL, 'Peaje USD 0.25 + ITBMS 7% por interacción.', 0.25, 'Acceso web a vacante, chat con chatbot, visualización de detalle.', 'Facturación mensual emulada DGI Panamá. Pago contra factura HTML.', '<p>Contrato Energía Bocas - peaje USD 0.25 + ITBMS 7%.</p>', JSON_OBJECT('version', 'seed', 'currency', 'USD', 'peaje', 0.25, 'itbms', 0.07), 'v1-panama'),
	('44444444-0005-4444-aaaa-000000000014', 0, NULL, 'Peaje USD 0.28 + ITBMS 7% por interacción.', 0.28, 'Acceso web a vacante, chat con chatbot, visualización de detalle.', 'Facturación mensual emulada DGI Panamá. Pago contra factura HTML.', '<p>Contrato Cervecería Nacional - peaje USD 0.28 + ITBMS 7%.</p>', JSON_OBJECT('version', 'seed', 'currency', 'USD', 'peaje', 0.28, 'itbms', 0.07), 'v1-panama'),
	('44444444-0029-4444-aaaa-000000000129', 0, NULL, 'Peaje USD 0.18 + ITBMS 7% por interacción.', 0.18, 'Acceso web a vacante, chat con chatbot, visualización de detalle.', 'Facturación mensual emulada DGI Panamá. Pago contra factura HTML.', '<p>Contrato MINSA - peaje USD 0.18 + ITBMS 7%.</p>', JSON_OBJECT('version', 'seed', 'currency', 'USD', 'peaje', 0.18, 'itbms', 0.07), 'v1-panama'),
	('44444444-0030-4444-aaaa-000000000130', 0, NULL, 'Peaje USD 0.32 + ITBMS 7% por interacción.', 0.32, 'Acceso web a vacante, chat con chatbot, visualización de detalle.', 'Facturación mensual emulada DGI Panamá. Pago contra factura HTML.', '<p>Contrato ACP - peaje USD 0.32 + ITBMS 7%.</p>', JSON_OBJECT('version', 'seed', 'currency', 'USD', 'peaje', 0.32, 'itbms', 0.07), 'v1-panama'),
	('44444444-0033-4444-aaaa-000000000133', 0, NULL, 'Peaje USD 0.27 + ITBMS 7% por interacción.', 0.27, 'Acceso web a vacante, chat con chatbot, visualización de detalle.', 'Facturación mensual emulada DGI Panamá. Pago contra factura HTML.', '<p>Contrato DevSoft PA - peaje USD 0.27 + ITBMS 7%.</p>', JSON_OBJECT('version', 'seed', 'currency', 'USD', 'peaje', 0.27, 'itbms', 0.07), 'v1-panama'),
	('44444444-0035-4444-aaaa-000000000135', 0, NULL, 'Peaje USD 0.29 + ITBMS 7% por interacción.', 0.29, 'Acceso web a vacante, chat con chatbot, visualización de detalle.', 'Facturación mensual emulada DGI Panamá. Pago contra factura HTML.', '<p>Contrato Panamá Hub - peaje USD 0.29 + ITBMS 7%.</p>', JSON_OBJECT('version', 'seed', 'currency', 'USD', 'peaje', 0.29, 'itbms', 0.07), 'v1-panama')
ON DUPLICATE KEY UPDATE toll_description=VALUES(toll_description), toll_usd_per_interaction=VALUES(toll_usd_per_interaction);

-- ============================================================
-- VACANTES (30 vacantes distribuidas)
-- ============================================================
INSERT IGNORE INTO vacancies (id, company_id, title, description, location, salary, status) VALUES
	-- Chiriquí (5 vacantes)
	('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Analista de Datos (Chiriquí)', 'Modelos de demanda y tableros para operaciones logísticas.', 'David, Chiriquí', 'USD 1,200', 'open'),
	('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'Barista Especializado', 'Preparación de café de especialidad y atención al cliente.', 'Boquete, Chiriquí', 'USD 850', 'open'),
	('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'Enfermera Jefe', 'Supervisión de personal de enfermería y coordinación de turnos.', 'David, Chiriquí', 'USD 1,500', 'open'),
	('77777777-1111-4444-aaaa-000000000001', '44444444-0001-4444-aaaa-000000000101', 'Agrónomo Especialista', 'Control de cultivos y mejoramiento de producción agrícola.', 'Volcán, Chiriquí', 'USD 1,100', 'open'),
	('77777777-2222-4444-aaaa-000000000002', '44444444-0002-4444-aaaa-000000000102', 'Coordinador Logístico', 'Gestión de carga en frontera y coordinación aduanera.', 'Paso Canoas, Chiriquí', 'USD 1,300', 'open'),
	
	-- Panamá (5 vacantes)
	('77777777-3333-4444-aaaa-000000000003', '44444444-0003-4444-aaaa-000000000103', 'Administrador de Contratos', 'Gestión de contratos y licitaciones para transporte público.', 'Panamá Oeste', 'USD 1,450', 'open'),
	('77777777-4444-4444-aaaa-000000000004', '44444444-0004-4444-aaaa-000000000104', 'Ejecutivo de Banca Personal', 'Atención a clientes y venta de productos financieros.', 'Panamá', 'USD 1,600', 'open'),
	('77777777-5555-4444-aaaa-000000000005', '44444444-0005-4444-aaaa-000000000105', 'Analista de Siniestros', 'Evaluación y procesamiento de reclamos de seguros.', 'Panamá', 'USD 1,400', 'open'),
	('77777777-6666-4444-aaaa-000000000006', '44444444-0006-4444-aaaa-000000000106', 'Médico Especialista', 'Cardiólogo con experiencia en diagnóstico y tratamiento.', 'Panamá', 'USD 3,500', 'open'),
	('77777777-7777-4444-aaaa-000000000007', '44444444-0007-4444-aaaa-000000000107', 'Profesor de Ingeniería', 'Docencia en facultad de ingeniería civil.', 'Panamá', 'USD 2,200', 'open'),
	
	-- Panamá Oeste (3 vacantes)
	('77777777-8888-4444-aaaa-000000000008', '44444444-0008-4444-aaaa-000000000108', 'Ingeniero Civil', 'Supervisión de obras de construcción residencial.', 'La Chorrera', 'USD 1,800', 'open'),
	('77777777-9999-4444-aaaa-000000000009', '44444444-0009-4444-aaaa-000000000109', 'Gerente de Tienda', 'Administración de local comercial y equipo de ventas.', 'Arraiján', 'USD 1,350', 'open'),
	('77777777-0001-4444-aaaa-000000000010', '44444444-0010-4444-aaaa-000000000110', 'Técnico de Laboratorio', 'Análisis clínicos y apoyo diagnóstico.', 'La Chorrera', 'USD 950', 'open'),
	
	-- Colón (2 vacantes)
	('77777777-0002-4444-aaaa-000000000011', '44444444-1111-4444-aaaa-000000000001', 'Ingeniero de Datos Senior', 'Pipelines y tableros para logística en Colón.', 'Colón, Colón', 'USD 1,800', 'open'),
	('77777777-0003-4444-aaaa-000000000012', '44444444-0011-4444-aaaa-000000000111', 'Agente Comercial ZLC', 'Venta de servicios de zona libre a empresas.', 'Colón', 'USD 1,250', 'open'),
	
	-- Veraguas (2 vacantes)
	('77777777-0004-4444-aaaa-000000000013', '44444444-7777-4444-aaaa-000000000007', 'Especialista de Talento', 'Reclutamiento para fincas y plantas de empaque.', 'Santiago, Veraguas', 'USD 1,000', 'open'),
	('77777777-0005-4444-aaaa-000000000014', '44444444-0013-4444-aaaa-000000000113', 'Profesor de Matemáticas', 'Docencia en educación superior.', 'Santiago, Veraguas', 'USD 1,400', 'open'),
	
	-- Herrera (2 vacantes)
	('77777777-0006-4444-aaaa-000000000015', '44444444-2222-4444-aaaa-000000000002', 'Médico General APS', 'Atención primaria y coordinación con especialistas.', 'Chitré, Herrera', 'USD 2,100', 'open'),
	('77777777-0007-4444-aaaa-000000000016', '44444444-0015-4444-aaaa-000000000115', 'Carnicero Especializado', 'Procesamiento y control de calidad de carnes.', 'La Arena, Herrera', 'USD 900', 'open'),
	
	-- Los Santos (2 vacantes)
	('77777777-0008-4444-aaaa-000000000017', '44444444-3333-4444-aaaa-000000000003', 'Coordinador de Turismo', 'Gestión de rutas y experiencias turísticas locales.', 'Las Tablas, Los Santos', 'USD 1,150', 'open'),
	('77777777-0009-4444-aaaa-000000000018', '44444444-0017-4444-aaaa-000000000117', 'Organizador de Eventos', 'Coordinación del Festival de la Pollera.', 'Las Tablas, Los Santos', 'USD 1,000', 'open'),
	
	-- Coclé (2 vacantes)
	('77777777-0010-4444-aaaa-000000000019', '44444444-4444-4444-aaaa-000000000004', 'Supervisor Agroindustrial', 'Supervisión de planta empacadora y cadena fría.', 'Penonomé, Coclé', 'USD 1,050', 'open'),
	('77777777-0011-4444-aaaa-000000000020', '44444444-0019-4444-aaaa-000000000119', 'Recepcionista Termal', 'Atención al cliente en centro termal.', 'Aguadulce, Coclé', 'USD 700', 'open'),
	
	-- Darién (2 vacantes)
	('77777777-0012-4444-aaaa-000000000021', '44444444-5555-4444-aaaa-000000000005', 'Operador Logístico', 'Operaciones de puerto y despacho terrestre.', 'La Palma, Darién', 'USD 1,000', 'open'),
	('77777777-0013-4444-aaaa-000000000022', '44444444-0021-4444-aaaa-000000000121', 'Guía Turístico', 'Rutas ecoturísticas en Parque Nacional Darién.', 'Garachiné, Darién', 'USD 850', 'open'),
	
	-- Bocas del Toro (2 vacantes)
	('77777777-0014-4444-aaaa-000000000023', '44444444-6666-4444-aaaa-000000000006', 'Técnico Eléctrico', 'Mantenimiento de microred y paneles solares.', 'Isla Colón, Bocas del Toro', 'USD 1,200', 'open'),
	('77777777-0015-4444-aaaa-000000000024', '44444444-0023-4444-aaaa-000000000123', 'Guía de Buceo', 'Inmersiones y recorridos marinos.', 'Isla Colón, Bocas', 'USD 900', 'open'),
	
	-- Nacionales (3 vacantes)
	('77777777-0016-4444-aaaa-000000000025', '44444444-0005-4444-aaaa-000000000014', 'Microbiólogo de Control de Calidad', 'Análisis de calidad en proceso de cerveza.', 'Panamá', 'USD 1,300', 'open'),
	('77777777-0017-4444-aaaa-000000000026', '44444444-0029-4444-aaaa-000000000129', 'Epidemiólogo', 'Monitoreo y control de enfermedades.', 'Panamá', 'USD 2,500', 'open'),
	('77777777-0018-4444-aaaa-000000000027', '44444444-0030-4444-aaaa-000000000130', 'Ingeniero de Tránsito Acuático', 'Control de tráfico en esclusas del canal.', 'Balboa, Panamá', 'USD 3,000', 'open');

-- ============================================================
-- INTERACCIONES (50 interacciones distribuidas)
-- ============================================================
INSERT IGNORE INTO interactions (id, vacancy_id, company_id, channel, event, created_at) VALUES
	-- Interacciones para Chiriquí
	('77777777-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'web', 'view', NOW() - INTERVAL 2 DAY),
	('88888888-8888-8888-8888-888888888888', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'chatbot', 'chat', NOW() - INTERVAL 1 DAY),
	('99999999-9999-9999-9999-999999999999', '55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'web', 'view', NOW() - INTERVAL 3 DAY),
	('aaaa9999-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'web', 'view', NOW() - INTERVAL 1 DAY),
	
	-- Interacciones para Panamá
	('bbbb9999-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '77777777-3333-4444-aaaa-000000000003', '44444444-0003-4444-aaaa-000000000103', 'web', 'view', NOW() - INTERVAL 1 DAY),
	('cccc9999-cccc-cccc-cccc-cccccccccccc', '77777777-4444-4444-aaaa-000000000004', '44444444-0004-4444-aaaa-000000000104', 'web', 'view', NOW()),
	('dddd9999-dddd-dddd-dddd-dddddddddddd', '77777777-4444-4444-aaaa-000000000004', '44444444-0004-4444-aaaa-000000000104', 'chatbot', 'chat', NOW() - INTERVAL 12 HOUR),
	('eeee9999-eeee-eeee-eeee-eeeeeeeeeeee', '77777777-5555-4444-aaaa-000000000005', '44444444-0005-4444-aaaa-000000000105', 'web', 'view', NOW() - INTERVAL 2 DAY),
	
	-- Interacciones para Panamá Oeste
	('ffff9999-ffff-ffff-ffff-ffffffffffff', '77777777-8888-4444-aaaa-000000000008', '44444444-0008-4444-aaaa-000000000108', 'web', 'view', NOW() - INTERVAL 1 DAY),
	('11119999-1111-1111-1111-111111111111', '77777777-9999-4444-aaaa-000000000009', '44444444-0009-4444-aaaa-000000000109', 'web', 'view', NOW() - INTERVAL 3 DAY),
	
	-- Interacciones para Colón
	('22229999-2222-2222-2222-222222222222', '77777777-0002-4444-aaaa-000000000011', '44444444-1111-4444-aaaa-000000000001', 'web', 'view', NOW() - INTERVAL 1 DAY),
	('33339999-3333-3333-3333-333333333333', '77777777-0002-4444-aaaa-000000000011', '44444444-1111-4444-aaaa-000000000001', 'chatbot', 'chat', NOW() - INTERVAL 12 HOUR),
	
	-- Interacciones para Veraguas
	('44449999-4444-4444-4444-444444444444', '77777777-0004-4444-aaaa-000000000013', '44444444-7777-4444-aaaa-000000000007', 'web', 'view', NOW() - INTERVAL 2 DAY),
	('55559999-5555-5555-5555-555555555555', '77777777-0005-4444-aaaa-000000000014', '44444444-0013-4444-aaaa-000000000113', 'web', 'view', NOW() - INTERVAL 1 DAY),
	
	-- Interacciones para Herrera
	('66669999-6666-6666-6666-666666666666', '77777777-0006-4444-aaaa-000000000015', '44444444-2222-4444-aaaa-000000000002', 'web', 'view', NOW() - INTERVAL 2 DAY),
	('77779999-7777-7777-7777-777777777777', '77777777-0007-4444-aaaa-000000000016', '44444444-0015-4444-aaaa-000000000115', 'web', 'view', NOW() - INTERVAL 3 DAY),
	
	-- Interacciones para Los Santos
	('88889999-8888-8888-8888-888888888888', '77777777-0008-4444-aaaa-000000000017', '44444444-3333-4444-aaaa-000000000003', 'web', 'view', NOW() - INTERVAL 1 DAY),
	('99990000-9999-9999-9999-999999999999', '77777777-0009-4444-aaaa-000000000018', '44444444-0017-4444-aaaa-000000000117', 'web', 'view', NOW() - INTERVAL 2 DAY),
	
	-- Interacciones para Coclé
	('aaaa0000-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '77777777-0010-4444-aaaa-000000000019', '44444444-4444-4444-aaaa-000000000004', 'web', 'view', NOW() - INTERVAL 1 DAY),
	('bbbb0000-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '77777777-0011-4444-aaaa-000000000020', '44444444-0019-4444-aaaa-000000000119', 'web', 'view', NOW() - INTERVAL 2 DAY),
	
	-- Interacciones para Darién
	('cccc0000-cccc-cccc-cccc-cccccccccccc', '77777777-0012-4444-aaaa-000000000021', '44444444-5555-4444-aaaa-000000000005', 'web', 'view', NOW() - INTERVAL 1 DAY),
	('dddd0000-dddd-dddd-dddd-dddddddddddd', '77777777-0013-4444-aaaa-000000000022', '44444444-0021-4444-aaaa-000000000121', 'web', 'view', NOW() - INTERVAL 3 DAY),
	
	-- Interacciones para Bocas del Toro
	('eeee0000-eeee-eeee-eeee-eeeeeeeeeeee', '77777777-0014-4444-aaaa-000000000023', '44444444-6666-4444-aaaa-000000000006', 'web', 'view', NOW() - INTERVAL 1 DAY),
	('ffff0000-ffff-ffff-ffff-ffffffffffff', '77777777-0015-4444-aaaa-000000000024', '44444444-0023-4444-aaaa-000000000123', 'web', 'view', NOW() - INTERVAL 2 DAY),
	
	-- Interacciones para Empresas Nacionales
	('11110000-1111-1111-1111-111111111111', '77777777-0016-4444-aaaa-000000000025', '44444444-0005-4444-aaaa-000000000014', 'web', 'view', NOW() - INTERVAL 1 DAY),
	('22220000-2222-2222-2222-222222222222', '77777777-0017-4444-aaaa-000000000026', '44444444-0029-4444-aaaa-000000000129', 'web', 'view', NOW() - INTERVAL 2 DAY),
	('33330000-3333-3333-3333-333333333333', '77777777-0018-4444-aaaa-000000000027', '44444444-0030-4444-aaaa-000000000130', 'web', 'view', NOW() - INTERVAL 1 DAY),
	
	-- Más interacciones variadas (para llenar 50)
	('44440000-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'web', 'view', NOW() - INTERVAL 5 DAY),
	('55550000-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'chatbot', 'chat', NOW() - INTERVAL 4 DAY),
	('66660000-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'web', 'view', NOW() - INTERVAL 3 DAY),
	('77770000-7777-7777-7777-777777777777', '77777777-3333-4444-aaaa-000000000003', '44444444-0003-4444-aaaa-000000000103', 'web', 'view', NOW() - INTERVAL 2 DAY),
	('88880000-8888-8888-8888-888888888888', '77777777-4444-4444-aaaa-000000000004', '44444444-0004-4444-aaaa-000000000104', 'web', 'view', NOW() - INTERVAL 1 DAY),
	('99990001-9999-9999-9999-999999999999', '77777777-5555-4444-aaaa-000000000005', '44444444-0005-4444-aaaa-000000000105', 'chatbot', 'chat', NOW() - INTERVAL 12 HOUR),
	('aaaa0001-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '77777777-8888-4444-aaaa-000000000008', '44444444-0008-4444-aaaa-000000000108', 'web', 'view', NOW() - INTERVAL 2 DAY),
	('bbbb0001-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '77777777-9999-4444-aaaa-000000000009', '44444444-0009-4444-aaaa-000000000109', 'web', 'view', NOW() - INTERVAL 3 DAY),
	('cccc0001-cccc-cccc-cccc-cccccccccccc', '77777777-0002-4444-aaaa-000000000011', '44444444-1111-4444-aaaa-000000000001', 'web', 'view', NOW() - INTERVAL 4 DAY),
	('dddd0001-dddd-dddd-dddd-dddddddddddd', '77777777-0004-4444-aaaa-000000000013', '44444444-7777-4444-aaaa-000000000007', 'web', 'view', NOW() - INTERVAL 5 DAY),
	('eeee0001-eeee-eeee-eeee-eeeeeeeeeeee', '77777777-0006-4444-aaaa-000000000015', '44444444-2222-4444-aaaa-000000000002', 'web', 'view', NOW() - INTERVAL 1 DAY),
	('ffff0001-ffff-ffff-ffff-ffffffffffff', '77777777-0008-4444-aaaa-000000000017', '44444444-3333-4444-aaaa-000000000003', 'chatbot', 'chat', NOW() - INTERVAL 2 DAY),
	('11110001-1111-1111-1111-111111111111', '77777777-0010-4444-aaaa-000000000019', '44444444-4444-4444-aaaa-000000000004', 'web', 'view', NOW() - INTERVAL 3 DAY),
	('22220001-2222-2222-2222-222222222222', '77777777-0012-4444-aaaa-000000000021', '44444444-5555-4444-aaaa-000000000005', 'web', 'view', NOW() - INTERVAL 4 DAY),
	('33330001-3333-3333-3333-333333333333', '77777777-0014-4444-aaaa-000000000023', '44444444-6666-4444-aaaa-000000000006', 'web', 'view', NOW() - INTERVAL 5 DAY),
	('44440001-4444-4444-4444-444444444444', '77777777-0016-4444-aaaa-000000000025', '44444444-0005-4444-aaaa-000000000014', 'web', 'view', NOW() - INTERVAL 1 DAY),
	('55550001-5555-5555-5555-555555555555', '77777777-0017-4444-aaaa-000000000026', '44444444-0029-4444-aaaa-000000000129', 'chatbot', 'chat', NOW() - INTERVAL 2 DAY),
	('66660001-6666-6666-6666-666666666666', '77777777-0018-4444-aaaa-000000000027', '44444444-0030-4444-aaaa-000000000130', 'web', 'view', NOW() - INTERVAL 3 DAY),
	('77770001-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'web', 'view', NOW() - INTERVAL 4 DAY),
	('88880001-8888-8888-8888-888888888888', '55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'web', 'view', NOW() - INTERVAL 5 DAY),
	('99990002-9999-9999-9999-999999999999', '66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'chatbot', 'chat', NOW() - INTERVAL 1 DAY),
	('aaaa0002-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '77777777-3333-4444-aaaa-000000000003', '44444444-0003-4444-aaaa-000000000103', 'web', 'view', NOW() - INTERVAL 2 DAY),
	('bbbb0002-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '77777777-4444-4444-aaaa-000000000004', '44444444-0004-4444-aaaa-000000000104', 'web', 'view', NOW() - INTERVAL 3 DAY),
	('cccc0002-cccc-cccc-cccc-cccccccccccc', '77777777-5555-4444-aaaa-000000000005', '44444444-0005-4444-aaaa-000000000105', 'web', 'view', NOW() - INTERVAL 4 DAY),
	('dddd0002-dddd-dddd-dddd-dddddddddddd', '77777777-8888-4444-aaaa-000000000008', '44444444-0008-4444-aaaa-000000000108', 'web', 'view', NOW() - INTERVAL 5 DAY);

-- ============================================================
-- FIN DEL SCRIPT - 50 empresas panameñas completas
-- ============================================================