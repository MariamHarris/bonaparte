require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  try {
    const [rows] = await pool.query('SHOW TABLES');
    console.log('MySQL OK. Tablas:');
    console.table(rows);
    process.exit(0);
  } catch (err) {
    console.error('MySQL check failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
