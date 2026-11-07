const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  port: 8889,
  user: 'root',
  password: 'root',
  database: 'nodejs_db_kadai',
});

async function closePool() {
  await pool.end();
}

async function executeQuery(sql, params = []) {
  const [result] = await pool.execute(sql, params);
  return result;
}

module.exports = { closePool, executeQuery };