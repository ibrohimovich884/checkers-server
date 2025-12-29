import authMiddleware from '../middlewares/authMiddleware.js';
import gameHandler from './gameHandler.js';

module.exports = (io) => {
    io.use(authMiddleware);

    io.on('connection', (socket) => {
        console.log('User connected:', socket.user.id);
        gameHandler(io, socket);
        
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
};