import engine from '../services/checkersEngine.js';
import * as gameController from '../controllers/gameController.js';

const activeGames = new Map();

const gameHandler = (io, socket) => {
    const userId = socket.user?.id || 'guest_' + socket.id;
    const username = socket.user?.username || 'Guest';

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);

        const userData = {
            id: socket.user.id,
            username: socket.user.username,
            avatar_url: socket.user.avatar_url
        };

        if (!activeGames.has(roomId)) {
            activeGames.set(roomId, {
                board: engine.createInitialBoard(),
                turn: 'white',
                players: [userData], // Birinchi o'yinchi
                mustMovePiece: null
            });
        } else {
            const game = activeGames.get(roomId);
            // Ikkinchi o'yinchi qo'shilishi (agar u xonada bo'lmasa)
            if (game.players.length < 2 && !game.players.find(p => p.id === userData.id)) {
                game.players.push(userData);
            }
        }

        io.to(roomId).emit('gameState', activeGames.get(roomId));
    });

    socket.on('makeMove', async (data) => {
        const { roomId, from, to } = data;
        let game = activeGames.get(roomId);

        if (!game) return;

        // 1. "Urish majburiy" qoidasini tekshirish
        const canJump = engine.hasAnyJump(game); // O'yinchida urish imkoniyati bormi?
        const isActuallyJumping = Math.abs(from.r - to.r) >= 2; // O'yinchi urishni tanladimi?

        if (canJump && !isActuallyJumping) {
            return socket.emit('error', 'Urish majburiy! Boshqa dona bilan raqibni urishingiz kerak.');
        }

        // 2. Ketma-ket urish tekshiruvi (Multi-jump)
        if (game.mustMovePiece) {
            if (from.r !== game.mustMovePiece.r || from.c !== game.mustMovePiece.c) {
                return socket.emit('error', 'Siz faqat urishni boshlagan dona bilan davom eta olasiz!');
            }
        }

        // 2. Yurish qoidaga to'g'ri kelishini tekshirish
        if (engine.isValidMove(game, from, to)) {
            const isJump = Math.abs(from.r - to.r) >= 2;
            game.board = engine.movePiece(game.board, from, to);

            // 3. Yana urish imkonini tekshirish (Multi-jump)
            if (isJump && engine.canCaptureMore(game.board, to.r, to.c)) {
                game.mustMovePiece = { r: to.r, c: to.c };
                console.log(`🔄 Multi-jump: ${to.r}:${to.c} bilan davom etish shart.`);
            } else {
                game.mustMovePiece = null;
                game.turn = game.turn === 'white' ? 'black' : 'white';
            }

            // 4. Yangilangan holatni hammaga yuborish
            io.to(roomId).emit('updateBoard', game);

            // 5. O'yin tugaganini tekshirish
            if (engine.isGameOver(game.board)) {
                try {
                    await gameController.saveGameResult(roomId, userId, game.board);
                } catch (e) {
                    console.error("DB xato:", e.message);
                }
                io.to(roomId).emit('gameOver', { winner: username });
                activeGames.delete(roomId);
            }
        }
    });
};

export default gameHandler;