const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: !process.env.CI ? { rejectUnauthorized: false } : undefined
});

pool.on('connect', () => console.log('Postgres connected'));

module.exports = pool;
