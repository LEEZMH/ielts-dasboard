const { Pool } = require("pg");

let pool;

function createConfigError(message = "Database configuration is missing.") {
  const error = new Error(message);
  error.code = "server_misconfigured";
  return error;
}

function getDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
}

function shouldUseSsl(connectionString) {
  return !/localhost|127\.0\.0\.1/.test(connectionString) && process.env.DATABASE_SSL !== "disable";
}

function getPool() {
  if (pool) {
    return pool;
  }

  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    throw createConfigError();
  }

  pool = new Pool({
    connectionString,
    ssl: shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : false,
    max: 4,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });

  return pool;
}

async function query(text, params = []) {
  return getPool().query(text, params);
}

async function withTransaction(handler) {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await handler(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  createConfigError,
  query,
  withTransaction,
};
