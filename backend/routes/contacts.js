const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Contact = require('../models/Contact');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const filter = { createdBy: req.userId };
    if (search) filter.$or = [
      { company: new RegExp(search, 'i') },
      { name: new RegExp(search, 'i') },
    ];
    const contacts = await Contact.find(filter)
      .sort({ company: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, createdBy: req.userId });
    if (!contact) return res.status(404).json({ error: 'Not found' });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const contact = new Contact({ ...req.body, createdBy: req.userId });
    await contact.save();
    res.status(201).json(contact);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!contact) return res.status(404).json({ error: 'Not found' });
    res.json(contact);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({ _id: req.params.id, createdBy: req.userId });
    if (!contact) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/comm', async (req, res) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, createdBy: req.userId });
    if (!contact) return res.status(404).json({ error: 'Not found' });
    contact.commHistory.push({ ...req.body, by: req.userId });
    await contact.save();
    res.status(201).json(contact);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id/comm/:logId', async (req, res) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, createdBy: req.userId });
    if (!contact) return res.status(404).json({ error: 'Not found' });
    contact.commHistory.pull({ _id: req.params.logId });
    await contact.save();
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
