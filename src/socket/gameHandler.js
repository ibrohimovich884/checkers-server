import engine from '../services/checkersEngine.js';
import * as gameController from '../controllers/gameController.js';

const activeGames = new Map(); 

const gameHandler = (io, socket) => {
    // 1. User borligini tekshirish (Crash bo'lmasligi uchun)
    const userId = socket.user?.id || 'guest_' + socket.id;
    const username = socket.user?.username || 'Guest';

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log(`👤 ${username} xonaga kirdi: ${roomId}`);
        
        if (!activeGames.has(roomId)) {
            activeGames.set(roomId, {
                board: engine.createInitialBoard(),
                turn: 'white',
                players: [userId]
            });
        } else {
            const game = activeGames.get(roomId);
            if (!game.players.includes(userId)) {
                game.players.push(userId);
            }
        }
        
        io.to(roomId).emit('gameState', activeGames.get(roomId));
    });

    socket.on('makeMove', async (data) => {
        const { roomId, from, to } = data;
        let game = activeGames.get(roomId);

        if (game && engine.isValidMove(game, from, to)) {
            game.board = engine.movePiece(game.board, from, to);
            game.turn = game.turn === 'white' ? 'black' : 'white';

            io.to(roomId).emit('updateBoard', game);

            if (engine.isGameOver(game.board)) {
                try {
                    await gameController.saveGameResult(roomId, userId, game.board);
                } catch (e) {
                    console.error("DB saqlashda xato:", e.message);
                }
                io.to(roomId).emit('gameOver', { winner: username });
                activeGames.delete(roomId);
            }
        }
    });
};

export default gameHandler;