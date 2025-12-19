require('dotenv').config();
const app = require('./app');
const { connectMongo, connectMySQL } = require('./db');

const PORT = process.env.PORT || 3001;

async function startServer() {
  // No bloquea el arranque si las DB aún no están levantadas
  await connectMongo();
  await connectMySQL();
  app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en puerto ${PORT}`);
  });
}

startServer();
