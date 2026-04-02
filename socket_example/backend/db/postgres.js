const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL;

const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
    })
  : null;

const testDatabaseConnection = async () => {
  if (!pool) {
    console.warn('[db] DATABASE_URL is not set, database ping skipped');
    return false;
  }

  const client = await pool.connect();

  try {
    const result = await client.query('SELECT NOW() AS now');
    console.log(`[db] PostgreSQL connected at ${result.rows[0].now}`);
    return true;
  } finally {
    client.release();
  }
};

const query = async (text, params = []) => {
  if (!pool) {
    throw new Error('DATABASE_URL is not set');
  }

  return pool.query(text, params);
};

module.exports = {
  pool,
  query,
  testDatabaseConnection,
};
