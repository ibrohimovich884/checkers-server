import pool from '../config/db.js'; // Bizning local ulanishimiz

export async function saveGameResult(roomId, winnerId, boardHistory) {
    const query = `
        INSERT INTO game_results (room_id, winner_id, final_state, played_at)
        VALUES ($1, $2, $3, NOW())
    `;
    const values = [roomId, winnerId, JSON.stringify(boardHistory)];

    try {
        // Neon-mas, bizning pool orqali so'rov yuboramiz
        await pool.query(query, values);
        console.log("✅ Natija local PostgreSQL-ga saqlandi.");
    } catch (error) {
        console.error("❌ Local DB error:", error.message);
    }
}