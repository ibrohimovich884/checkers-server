import jwt from 'jsonwebtoken';

const authMiddleware = (socket, next) => {
    // Client-dan ulanishda yuborilgan tokenni olish
    const token = socket.handshake.auth?.token;

    if (!token) {
        return next(new Error("Avtorizatsiya xatosi: Token topilmadi"));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded; // Foydalanuvchi ma'lumotlarini socketga biriktirish
        next();
    } catch (err) {
        next(new Error("Avtorizatsiya xatosi: Yaroqsiz token"));
    }
};

export default authMiddleware;