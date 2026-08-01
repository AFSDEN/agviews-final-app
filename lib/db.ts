import { Pool, PoolClient, QueryResult } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      statement_timeout: 30000,
    });

    pool.on('error', (err: Error) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  return pool;
}

export async function query<T = any>(
  text: string,
  values?: any[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  return pool.query<T>(text, values);
}

export async function queryOne<T = any>(
  text: string,
  values?: any[]
): Promise<T | null> {
  const result = await query<T>(text, values);
  return result.rows[0] || null;
}

export async function queryMany<T = any>(
  text: string,
  values?: any[]
): Promise<T[]> {
  const result = await query<T>(text, values);
  return result.rows;
}

export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  return pool.connect();
}

export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Health check function
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await query('SELECT 1');
    return result.rowCount === 1;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}
