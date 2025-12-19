# Bonaparte - Prototipo de Gestión de Vacantes

Este proyecto es un prototipo de sitio web para la gestión de vacantes de empresas públicas y privadas en la provincia de Chiriquí, Panamá. Permite a las empresas publicar vacantes y a los usuarios acceder a ellas sin necesidad de crear una hoja de vida. Incluye módulos para empresas, empresa consultora, chatbot, facturación y base de datos con replicación.

## Estructura Inicial del Proyecto

- `/backend` - API y lógica de negocio (Node.js/Express)
- `/frontend` - Interfaz de usuario (React)
- `/database` - Scripts y configuración de bases de datos (MongoDB, MySQL)
- `/docker` - Archivos para despliegue y orquestación (Docker)
- `/docs` - Documentación y diagramas

## Módulos Principales
- Empresas (públicas y privadas)
- Empresa Consultora
- Chatbot
- Facturación
- Base de Datos (replicación y balanceo)

## Instalación y Ejecución
### Backend
- Instalar dependencias: `npm install`
- Ejecutar backend: `npm run dev`

### Base de datos (opciones)
**Opción A (recomendada): Docker Desktop + Compose**
- Instala Docker Desktop para Windows y asegúrate que el comando `docker` funcione en PowerShell.
- Luego ejecuta: `docker compose --env-file .env -f docker/docker-compose.yml up -d`

**Opción B: instalación local (sin Docker)**
- Instala MongoDB (puerto 27017) y MySQL (puerto 3306) en tu máquina.
- Verifica que `.env` apunte a `127.0.0.1`.

## Replicación + Balanceo (MySQL Externa → Interna)
Este proyecto incluye una configuración opcional de:
- **Replicación GTID**: `mysql-external` (relacional externa / primary) → `mysql-internal` (relacional interna / replica)
- **Balanceo**: **HAProxy** (puertos separados lectura/escritura)

### Levantar replicación
- `docker compose --env-file .env -f docker/docker-compose.replication.yml up -d`

Puertos:
- Primary (externa): `127.0.0.1:3307`
- Replica (interna): `127.0.0.1:3308`
- Balanceador (apps):
	- Escritura -> externa: `127.0.0.1:6033`
	- Lectura -> interna: `127.0.0.1:6034`

### Verificar replicación
- `node scripts/verify-mysql-replication.js`

---

> Sustituya este archivo con información relevante a medida que el proyecto evolucione.
