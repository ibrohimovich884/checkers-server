import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
});

// Jadval borligini tekshirish va yo'q bo'lsa yaratish
const initDatabase = async () => {
    const queryText = `
    CREATE TABLE IF NOT EXISTS game_results (
        id SERIAL PRIMARY KEY,
        room_id VARCHAR(100) NOT NULL,
        winner_id INTEGER,
        final_state JSONB NOT NULL,
        played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;

    try {
        const client = await pool.connect();
        await client.query(queryText);
        console.log("✅ Baza tayyor: 'game_results' jadvali tekshirildi/yaratildi.");
        client.release();
    } catch (err) {
        console.error("❌ Jadval yaratishda xato ketdi:", err.message);
    }
};

// Server yonganda ishga tushadi
initDatabase();

export default pool;