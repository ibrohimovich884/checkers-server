import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import socketMain from './src/socket/socketMain.js';
import pool from './src/config/db.js';

const app = express();
const server = createServer(app);

// 1. Asosiy route qo'shish (Server ishlashini tekshirish uchun)
app.get('/', (req, res) => {
    res.send("Server is ON and Running... 🚀");
});

// 2. CORS ni deployga moslash
const io = new Server(server, {
    cors: {
        // Ham localhost, ham deploy bo'lgan frontend manzillarini qo'shamiz
        origin: [
            "http://localhost:5173", 
            "https://checkers-one-two.vercel.app" // Sening Vercel manziling
        ],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// 3. Socket mantiqini ulash
socketMain(io);

// 4. DB va Serverni ishga tushirish
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error("❌ Baza bilan aloqa yo'q:", err.message);
        // Bazaga ulanolmasa ham serverni yoqish (ixtiyoriy, lekin debug uchun yaxshi)
        startServer();
    } else {
        console.log("✅ Baza bilan aloqa o'rnatildi");
        startServer();
    }
});

function startServer() {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log(`🚀 Server ${PORT}-portda ishga tushdi`);
    });
}