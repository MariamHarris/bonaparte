# Copilot Instructions for Bonaparte Project

- [x] Clarify Project Requirements
- [x] Scaffold the Project
- [x] Customize the Project
- [x] Install Required Extensions
- [x] Compile the Project
- [x] Create and Run Task
- [x] Launch the Project
- [x] Ensure Documentation is Complete

Status 2025-12-19:
- Backend dev arriba (`npm run dev`) usando MySQL primario 3307.
- Replicación MySQL levantada (primary 3307, replica 3308, HAProxy 6033/6034) y verificada con `scripts/verify-mysql-replication.js`.
- Smoke test API ejecutado OK (`scripts/smoke-test.ps1`) generando factura HTML en nginx (8080).
- Dash empresa renovado: contrato, datos, vacantes, facturas.
- Variables clave: `.env` con `MYSQL_HOST=127.0.0.1`, `MYSQL_PORT=3307`, `PY_ANALYTICS_URL=http://127.0.0.1:8000`.

Work through each checklist item systematically. Update this file as you complete each step.