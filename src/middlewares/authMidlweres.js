import jwt from 'jsonwebtoken';
import pool from '../config/db.js'; // Bazaga ulanishni import qiling

const authMiddleware = async (socket, next) => {
    const token = socket.handshake.auth?.token;

    console.log("📡 Backend: Ulanish so'rovi.");

    if (!token) {
        return next(new Error("Avtorizatsiya xatosi: Token topilmadi"));
    }

    try {
        // 1. Tokenni tekshirish
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 2. Bazadan foydalanuvchi ma'lumotlarini olish
        // Love Island bazasida foydalanuvchilar 'users' jadvalida bo'ladi
        const userRes = await pool.query(
            'SELECT id, username, avatar_url FROM users WHERE id = $1', 
            [decoded.id]
        );

        if (userRes.rows.length === 0) {
            console.log("❌ Backend: Foydalanuvchi bazadan topilmadi!");
            return next(new Error("Foydalanuvchi topilmadi"));
        }

        // 3. Socketga bazadan kelgan to'liq ma'lumotni biriktirish
        socket.user = {
            id: userRes.rows[0].id,
            username: userRes.rows[0].username,
            avatar_url: userRes.rows[0].avatar_url || '/avatar.png'
        };

        console.log(`✅ Backend: ${socket.user.username} muvaffaqiyatli ulandi.`);
        next();
    } catch (err) {
        console.log("❌ Backend: JWT xatosi:", err.message);
        next(new Error("Avtorizatsiya xatosi: Yaroqsiz token"));
    }
};

export default authMiddleware;