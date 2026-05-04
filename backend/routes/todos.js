const express  = require('express');
const router   = express.Router();
const auth     = require('../middleware/auth');
const TodoList = require('../models/TodoList');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const lists = await TodoList.find({ createdBy: req.userId }).sort({ pinned: -1, updatedAt: -1 });
    res.json(lists);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const list = await TodoList.findOne({ _id: req.params.id, createdBy: req.userId });
    if (!list) return res.status(404).json({ error: 'Not found' });
    res.json(list);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const list = await TodoList.create({ ...req.body, createdBy: req.userId });
    res.status(201).json(list);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const list = await TodoList.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.userId },
      req.body, { new: true, runValidators: true }
    );
    if (!list) return res.status(404).json({ error: 'Not found' });
    res.json(list);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await TodoList.findOneAndDelete({ _id: req.params.id, createdBy: req.userId });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
