import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Ulanishni tekshirish
pool.on('connect', () => {
    console.log('PostgreSQL-ga muvaffaqiyatli ulanish amalga oshdi');
});

pool.on('error', (err) => {
    console.error('Baza ulanishida kutilmagan xato:', err);
    process.exit(-1);
});

export const query = (text, params) => pool.query(text, params);
export default pool;