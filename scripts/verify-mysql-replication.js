require('dotenv').config();
const mysql = require('mysql2/promise');
const { randomUUID } = require('crypto');

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

(async () => {
  // Para la demo de replicación usamos los puertos publicados del compose de replicación
  const primary = {
    host: '127.0.0.1',
    port: 3307,
    user: 'bonaparte',
    password: process.env.MYSQL_PASSWORD || 'yourpassword',
    database: 'bonaparte',
  };

  const replica = {
    host: '127.0.0.1',
    port: 3308,
    user: 'bonaparte',
    password: process.env.MYSQL_PASSWORD || 'yourpassword',
    database: 'bonaparte',
  };

  const id = randomUUID();
  const name = `Empresa Replication ${id.slice(0, 8)}`;

  const writer = await mysql.createConnection(primary);
  const reader = await mysql.createConnection(replica);

  try {
    await writer.execute(
      'INSERT INTO companies (id, name, type) VALUES (?, ?, ?)',
      [id, name, 'private']
    );

    // Esperar un poco para que replique ("tiempo real" en demo suele ser segundos)
    for (let i = 0; i < 20; i++) {
      const [rows] = await reader.execute('SELECT id, name FROM companies WHERE id = ?', [id]);
      if (rows.length > 0) {
        console.log('OK: Replicación funcionando. Registro encontrado en replica.');
        console.log(rows[0]);
        process.exit(0);
      }
      await sleep(500);
    }

    console.error('FAIL: No se vio el registro en la replica dentro del tiempo esperado.');
    process.exit(1);
  } catch (err) {
    console.error('Error verificando replicación:', err.message);
    process.exit(1);
  } finally {
    await writer.end();
    await reader.end();
  }
})();
