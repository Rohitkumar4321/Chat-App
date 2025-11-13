require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const convRoutes = require('./routes/conversations');
const socketHandler = require('./socket');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/conversations', convRoutes);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

socketHandler(io);

const PORT = process.env.PORT || 4000;
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/chat-app')
  .then(() => {
    server.listen(PORT, () => console.log('Server listening on', PORT));
  })
  .catch(err => console.error(err));