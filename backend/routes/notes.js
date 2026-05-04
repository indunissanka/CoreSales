const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const Note    = require('../models/Note');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const notes = await Note.find({ createdBy: req.userId }).sort({ pinned: -1, updatedAt: -1 });
    res.json(notes);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, createdBy: req.userId });
    if (!note) return res.status(404).json({ error: 'Not found' });
    res.json(note);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const note = await Note.create({ ...req.body, createdBy: req.userId });
    res.status(201).json(note);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.userId },
      req.body, { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ error: 'Not found' });
    res.json(note);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Note.findOneAndDelete({ _id: req.params.id, createdBy: req.userId });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
