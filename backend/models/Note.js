const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  content:   { type: String, default: '' },
  color:     { type: String, default: '#ffffff' },
  pinned:    { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
