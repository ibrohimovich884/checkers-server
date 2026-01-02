import jwt from 'jsonwebtoken';

const authMiddleware = (socket, next) => {
    const token = socket.handshake.auth?.token;

    console.log("📡 Backend: Ulanish so'rovi keldi.");
    console.log("🔍 Backend: Kelgan token:", token ? "Bor (tekshirilmoqda...)" : "Yo'q (XATO!)");

    if (!token) {
        console.log("❌ Backend: Token topilmadi!");
        return next(new Error("Avtorizatsiya xatosi: Token topilmadi"));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
        // Token ichida username va avatar_url borligiga ishonch hosil qilamiz
        socket.user = {
            id: decoded.id,
            username: decoded.username,
            avatar_url: decoded.avatar_url || '/avatar.png'
        };
        next();
    } catch (err) {
        console.log("❌ Backend: JWT tasdiqlashda xato:", err.message);
        next(new Error("Avtorizatsiya xatosi: Yaroqsiz token"));
    }
};

export default authMiddleware;

// const authMiddleware = (socket, next) => {
//     // Vaqtincha har qanday ulanishga ruxsat beramiz
//     // Keyinchalik foydalanuvchi ma'lumotlarini bazadan olish uchun decoded qismini qaytarasan
//     socket.user = { id: 1, username: "Player_" + Math.floor(Math.random() * 100) };
//     console.log("🔓 Auth vaqtincha ochiq. Foydalanuvchi ulandi.");
//     next();
// };

// export default authMiddleware;