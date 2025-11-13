const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: String,
  createdAt: { type: Date, default: Date.now },
  deliveredTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});
module.exports = mongoose.model('Message', MessageSchema);