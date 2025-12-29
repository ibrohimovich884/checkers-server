import engine from '../services/checkersEngine.js';
import gameController from '../controllers/gameController.js';

// Local Data - Server xotirasida o'yinlarni vaqtincha saqlash
const activeGames = new Map(); 

const gameHandler = (io, socket) => {
    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        
        if (!activeGames.has(roomId)) {
            activeGames.set(roomId, {
                board: engine.createInitialBoard(),
                turn: 'white',
                players: [socket.user.id]
            });
        }
        socket.emit('gameState', activeGames.get(roomId));
    });

    socket.on('makeMove', async (data) => {
        const { roomId, from, to } = data;
        let game = activeGames.get(roomId);

        if (game && engine.isValidMove(game, from, to)) {
            // Local holatni yangilash
            game.board = engine.movePiece(game.board, from, to);
            game.turn = game.turn === 'white' ? 'black' : 'white';

            io.to(roomId).emit('updateBoard', game);

            // O'yin tugashini tekshirish
            if (engine.isGameOver(game.board)) {
                await gameController.saveGameResult(roomId, socket.user.id, game.board);
                io.to(roomId).emit('gameOver', { winner: socket.user.username });
                activeGames.delete(roomId); // Xotirani tozalash
            }
        }
    });
};

export default gameHandler;