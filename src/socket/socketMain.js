import authMiddleware from '../middleweres/authMidlweres.js';
import gameHandler from './gameHandler.js';

const socketMain = (io) => {
    io.use(authMiddleware);

    io.on('connection', (socket) => {
        console.log('Foydalanuvchi ulandi:', socket.user.id);
        gameHandler(io, socket);
        
        socket.on('disconnect', () => {
            console.log('Foydalanuvchi chiqdi');
        });
    });
};

// MANA SHU QATORNI QO'SHING YOKI TEKSHIRING:
export default socketMain;