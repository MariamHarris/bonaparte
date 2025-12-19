# Bonaparte - Prototipo de Gestión de Vacantes

Prototipo Panamá: vacantes públicas/privadas, peaje por interacción, facturación emulada DGI. Incluye API Node/Express, MySQL/Mongo, frontend estático (Nginx), chatbot y facturas HTML.

## Rutas rápidas
- Público: http://localhost:8080/
- Empresa: http://localhost:8080/empresa.html
- Consultora: http://localhost:8080/consultora.html
- API base: http://127.0.0.1:3001

## Requisitos
- Node 18+
- Docker Desktop (recomendado) con Compose
- PowerShell / bash

## Configuración de entorno
1) Copia `.env.example` a `.env` y ajusta credenciales/puertos.
2) Variables clave: `PORT`, `MYSQL_*`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `SECURE_MODE`, `INVOICES_PUBLIC_BASE`, `MYSQL_REPL_PASSWORD`.
3) Python analytics opcional: `PY_ANALYTICS_URL` (ej. `http://127.0.0.1:8000`) y `PY_ANALYTICS_TOKEN`.

## Puesta en marcha (Docker)
```bash
docker compose --env-file .env -f docker/docker-compose.yml up -d
# opcional: replicación + balanceo
docker compose --env-file .env -f docker/docker-compose.replication.yml up -d
```
Servicios que levanta: Mongo, MySQL, Nginx (frontend/facturas) y `analytics` (FastAPI en 8000).

## Semillas / datos demo
```bash
pwsh -c "Get-Content -Raw 'database/mysql/02_seed.sql' | docker exec -i bonaparte-mysql sh -c 'mysql -u$MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE'"
```
Usuarios demo (pass `demo123`): `consultora_demo`, `empresa_chiriqui`, `empresa_panama` y más empresas por provincia en `02_seed.sql`.

## Backend local
```bash
npm install
npm run dev   # backend en 3001
```

## Endpoints clave
- Auth: `POST /api/auth/login`, `/api/auth/register/consultora`, `/api/auth/register/company`
- Chatbot: `POST /api/chatbot/ask` (opcional `vacancyId`, registra interacción)
- Stats: `GET /api/stats/consultora?companyId=...` o `?vacancyId=...`; `GET /api/stats/empresa`
- Facturas: `POST /api/invoices/generate` (JWT consultora) → HTML en `/public/invoices/`

## Frontend (MVP estático)
- Consume `http://127.0.0.1:3001` vía `/public/app.js`.
- Secciones: público (vacantes + stats), empresa (vacantes propias), consultora (stats, facturación, chatbot dedicado).

## Modo seguro opcional
- `SECURE_MODE=true` obliga Bearer JWT (deshabilita `x-role`), requiere `JWT_SECRET` y reduce expiración por defecto a 1 día.

## Analytics/Chatbot en Python
- Microservicio FastAPI opcional (puerto 8000) con resumen de interacciones y chatbot de apoyo.
- Backend Node consume `PY_ANALYTICS_URL` y usa `PY_ANALYTICS_TOKEN` como x-api-key interna.
- Front consultora muestra gráficos (provincias y serie diaria) usando `/api/analytics/summary`.

## CI/CD
- `.github/workflows/ci.yml` instala dependencias y ejecuta `npm test` en push/PR a `main`.

## Pruebas
- El script `npm test` es placeholder. Añadir Mocha/Jest + Supertest para rutas críticas (auth, chatbot, invoices, stats) y actualizar el script.

## Replicación (opcional)
- Puertos: primary 3307, replica 3308, HAProxy RW 6033 / RO 6034.
- Verificación: `node scripts/verify-mysql-replication.js`.

## Decisiones técnicas
- Node/Express + MySQL (mysql2) y Mongo (opcional).
- JWT por rol (`empresa`/`consultora`), modo seguro conmutado por variable.
- Frontend estático para rapidez; facturas servidas por Nginx.

## Pendientes sugeridos
- Validaciones de formularios y mensajes de error más claros en público/empresa.
- Logger estructurado (pino/winston) y métricas.
- Tests automatizados reales.
