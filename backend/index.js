require('dotenv').config();
const app = require('./app');
const { connectMongo, connectMySQL } = require('./db');
const { ensureSchema } = require('./services/ensure-schema');

const PORT = process.env.PORT || 3001;

async function startServer() {
  // No bloquea el arranque si las DB aún no están levantadas
  await connectMongo();
  const pool = await connectMySQL();
  if (pool) {
    await ensureSchema(pool);
  }

  const server = app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en puerto ${PORT}`);
  });

  server.on('error', (err) => {
    console.error('Error al iniciar servidor HTTP:', err && err.message ? err.message : err);
    if (err && err.code) console.error('Código:', err.code);
    process.exit(1);
  });
}

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();
