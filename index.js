// src/server.js yoki index.js
import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import socketMain from './src/socket/socketMain.js'; // .js kengaytmasi shart!

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

socketMain(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server ${PORT} portda ishladi`));