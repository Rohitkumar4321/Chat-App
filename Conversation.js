const mongoose = require('mongoose');
const ConvSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  updatedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Conversation', ConvSchema);