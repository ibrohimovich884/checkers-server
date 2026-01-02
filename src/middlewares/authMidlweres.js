import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Faylning o'zida ham dotenv yuklanishini ta'minlaymiz
dotenv.config();

const authMiddleware = (socket, next) => {
    const token = socket.handshake.auth?.token;

    console.log("--- 🛡️ AUTH DEBUG START ---");
    console.log("📍 Node Muhiti (NODE_ENV):", process.env.NODE_ENV);
    console.log("📍 JWT_SECRET borligi:", process.env.JWT_SECRET ? "✅ MAVJUD" : "❌ YO'Q (UNDEFINED!)");
    
    // Agar localda bo'lsangiz, secret qiymatini ham tekshirib oling (ixtiyoriy)
    // console.log("📍 JWT_SECRET qiymati:", process.env.JWT_SECRET); 

    if (!token) {
        console.log("❌ XATO: Token kelmadi!");
        return next(new Error("Avtorizatsiya xatosi: Token topilmadi"));
    }

    try {
        // Agar secret yo'q bo'lsa, verify() funksiyasi "secret must be provided" xatosini otadi
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        socket.user = {
            id: decoded.id,
            username: decoded.username || "Player",
        };

        console.log(`✅ MUVAFFAQIYAT: Foydalanuvchi ${socket.user.username} ulandi.`);
        console.log("--- 🛡️ AUTH DEBUG END ---");
        next();
    } catch (err) {
        console.log("❌ XATO (JWT Verify):", err.message);
        console.log("--- 🛡️ AUTH DEBUG END ---");
        next(new Error("Avtorizatsiya xatosi: " + err.message));
    }
};

export default authMiddleware;