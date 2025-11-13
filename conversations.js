const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Create or fetch 1:1 conversation
router.post('/', auth, async (req, res) => {
  const { otherUserId } = req.body;
  const userId = req.user.id;
  let conv = await Conversation.findOne({ participants: { $all: [userId, otherUserId], $size: 2 } });
  if (!conv) conv = await Conversation.create({ participants: [userId, otherUserId] });
  res.json(conv);
});

router.get('/:id/messages', auth, async (req, res) => {
  const { id } = req.params;
  const messages = await Message.find({ conversation: id }).sort({ createdAt: -1 }).limit(100);
  res.json(messages);
});

module.exports = router;