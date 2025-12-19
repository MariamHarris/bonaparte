// Configuración de conexión a MongoDB y MySQL

const mongoose = require('mongoose');
const mysql = require('mysql2/promise');
require('dotenv').config();

let mysqlPool;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// MongoDB
async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a MongoDB');
    return mongoose.connection;
  } catch (err) {
    console.error('Error conectando a MongoDB:', err.message);
    return null;
  }
}

// MySQL
async function connectMySQL({ retries = 5, delayMs = 1000 } = {}) {
  if (mysqlPool) return mysqlPool;

  const config = {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : undefined,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };

  console.log('MySQL config', {
    host: config.host,
    port: config.port,
    user: config.user,
    database: config.database,
  });

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      mysqlPool = mysql.createPool(config);
      await mysqlPool.query('SELECT 1');
      console.log('Conectado a MySQL');
      return mysqlPool;
    } catch (err) {
      const details = [err && err.message, err && err.code, err && err.errno].filter(Boolean).join(' | ');
      console.error(`Error conectando a MySQL (intento ${attempt}/${retries}):`, details || String(err));
      mysqlPool = undefined;
      if (attempt === retries) return null;
      await sleep(delayMs);
    }
  }
  return null;
}

function getMySQLPool() {
  return mysqlPool;
}

module.exports = { connectMongo, connectMySQL, getMySQLPool };
