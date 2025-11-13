const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');

module.exports = (io) => {
  const online = new Map();

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Auth required'));
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      socket.userId = payload.id;
      next();
    } catch (err) { next(err); }
  });

  io.on('connection', (socket) => {
    const uid = socket.userId.toString();
    online.set(uid, socket.id);
    io.emit('user:online', { userId: uid });

    socket.on('message:send', async (data) => {
      const msg = await Message.create({ conversation: data.conversationId, sender: uid, text: data.text });
      await Conversation.findByIdAndUpdate(data.conversationId, { updatedAt: Date.now() });
      const conv = await Conversation.findById(data.conversationId).populate('participants');
      conv.participants.forEach(p => {
        const pid = p._id.toString();
        if (pid !== uid) {
          const sid = online.get(pid);
          if (sid) io.to(sid).emit('message:new', msg);
        }
      });
      socket.emit('message:sent', msg);
    });

    socket.on('typing:start', (d) => {
      socket.broadcast.emit('typing:start', { conversationId: d.conversationId, userId: uid });
    });

    socket.on('typing:stop', (d) => socket.broadcast.emit('typing:stop', { conversationId: d.conversationId, userId: uid }));

    socket.on('message:read', async ({ messageId }) => {
      const message = await Message.findById(messageId);
      if (!message) return;
      if (!message.readBy.includes(uid)) { message.readBy.push(uid); await message.save(); }
      const senderSocket = online.get(message.sender.toString());
      if (senderSocket) io.to(senderSocket).emit('message:read', { messageId, userId: uid });
    });

    socket.on('disconnect', async () => {
      online.delete(uid);
      await User.findByIdAndUpdate(uid, { lastSeen: new Date() });
      io.emit('user:offline', { userId: uid });
    });
  });
};