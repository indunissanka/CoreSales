const mongoose = require('mongoose');

const todoListSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  items:     [{ text: String, done: { type: Boolean, default: false }, order: Number }],
  color:     { type: String, default: '#ffffff' },
  pinned:    { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('TodoList', todoListSchema);
