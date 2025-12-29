const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

exports.saveGameResult = async (roomId, winnerId, boardHistory) => {
    try {
        // Toza SQL orqali natijani yozish
        await sql`
            INSERT INTO game_results (room_id, winner_id, final_state, played_at)
            VALUES (${roomId}, ${winnerId}, ${JSON.stringify(boardHistory)}, NOW())
        `;
        console.log("Natija Neon DB ga saqlandi.");
    } catch (error) {
        console.error("Neon DB error:", error);
    }
};

const isValid = engine.isValidMove(game, from, to);
if (isValid) {
    const nextBoard = engine.movePiece(game.board, from, to);
    game.board = nextBoard;
    // ... turnni o'zgartirish va socket orqali tarqatish
}