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
  app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en puerto ${PORT}`);
  });
}

startServer();
