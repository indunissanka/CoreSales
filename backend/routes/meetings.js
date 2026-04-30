const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const Meeting = require('../models/Meeting');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const filter = { createdBy: req.userId };
    if (req.query.start) filter.date = { ...filter.date, $gte: new Date(req.query.start) };
    if (req.query.end)   filter.date = { ...filter.date, $lte: new Date(req.query.end) };
    if (req.query.status) filter.status = req.query.status;
    const meetings = await Meeting.find(filter)
      .populate('contact', 'company name')
      .populate('order', 'orderNo')
      .sort({ date: -1 });
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findOne({ _id: req.params.id, createdBy: req.userId })
      .populate('contact', 'company name')
      .populate('order', 'orderNo');
    if (!meeting) return res.status(404).json({ error: 'Not found' });
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const meeting = new Meeting({ ...req.body, createdBy: req.userId });
    await meeting.save();
    res.status(201).json(meeting);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.userId },
      req.body,
      { new: true, runValidators: true }
    ).populate('contact', 'company name').populate('order', 'orderNo');
    if (!meeting) return res.status(404).json({ error: 'Not found' });
    res.json(meeting);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findOneAndDelete({ _id: req.params.id, createdBy: req.userId });
    if (!meeting) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
