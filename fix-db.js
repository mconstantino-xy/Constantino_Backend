require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });

  await conn.query('ALTER TABLE users MODIFY type_id INT NULL DEFAULT NULL');
  console.log('Done! type_id is now optional.');

  await conn.end();
})().catch((e) => console.error('FAILED:', e.message));