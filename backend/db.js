// Configuración de conexión a MongoDB y MySQL

const mongoose = require('mongoose');
const mysql = require('mysql2/promise');
require('dotenv').config();

let mysqlPool;

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
async function connectMySQL() {
  try {
    if (mysqlPool) return mysqlPool;

    mysqlPool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : undefined,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      charset: 'utf8mb4',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // test rápido
    await mysqlPool.query('SELECT 1');
    console.log('Conectado a MySQL');
    return mysqlPool;
  } catch (err) {
    const details = [err && err.message, err && err.code, err && err.errno].filter(Boolean).join(' | ');
    console.error('Error conectando a MySQL:', details || String(err));
    mysqlPool = undefined;
    return null;
  }
}

function getMySQLPool() {
  return mysqlPool;
}

module.exports = { connectMongo, connectMySQL, getMySQLPool };
