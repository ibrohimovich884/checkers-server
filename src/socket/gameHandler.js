import engine from '../services/checkersEngine.js';
// 1. BU YERNI O'ZGARTIRDIK: hamma funksiyalarni gameController obyektiga yig'ib olamiz
import * as gameController from '../controllers/gameController.js';

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
        // Faqat kirgan odamga emas, xonadagilarga holatni yuborish yaxshi amaliyot
        io.to(roomId).emit('gameState', activeGames.get(roomId));
    });

    socket.on('makeMove', async (data) => {
        const { roomId, from, to } = data;
        let game = activeGames.get(roomId);

        // socket.user.id orqali turn-ni tekshirishni ham qo'shish kerak aslida
        if (game && engine.isValidMove(game, from, to)) {
            game.board = engine.movePiece(game.board, from, to);
            game.turn = game.turn === 'white' ? 'black' : 'white';

            io.to(roomId).emit('updateBoard', game);

            if (engine.isGameOver(game.board)) {
                // gameController endi xato bermaydi
                await gameController.saveGameResult(roomId, socket.user.id, game.board);
                io.to(roomId).emit('gameOver', { winner: socket.user.username });
                activeGames.delete(roomId);
            }
        }
    });
};

export default gameHandler;