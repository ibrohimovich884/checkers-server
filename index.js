import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import socketMain from './src/socket/socketMain.js';
import pool from './src/config/db.js';

const app = express();
const server = createServer(app);
// index.js ichida
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // SENING FRONTENDING PORTI
        methods: ["GET", "POST"],
        credentials: true
    }
});

socketMain(io);

// Serverni faqat DB ulanishidan keyin yoqamiz
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error("❌ Baza bilan aloqa yo'q. Serverni boshlab bo'lmaydi.");
    } else {
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => {
            console.log(`🚀 Server http://localhost:${PORT} da ishga tushdi`);
        });
    }
});
