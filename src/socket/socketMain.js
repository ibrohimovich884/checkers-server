import authMiddleware from '../middlewares/authMidlweres.js'; // Yo'lni to'g'ri yoz
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