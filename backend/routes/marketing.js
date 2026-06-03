const express    = require('express');
const router     = express.Router();
const auth       = require('../middleware/auth');
const Marketing  = require('../models/Marketing');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const filter = { createdBy: req.userId };
    if (search) filter.$or = [
      { companyName:   new RegExp(search, 'i') },
      { contactPerson: new RegExp(search, 'i') },
      { email:         new RegExp(search, 'i') },
    ];
    const [items, total] = await Promise.all([
      Marketing.find(filter).sort({ companyName: 1 }).skip((page - 1) * limit).limit(Number(limit)),
      Marketing.countDocuments(filter),
    ]);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Marketing.findOne({ _id: req.params.id, createdBy: req.userId });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { companyName, contactPerson, email, phone, notes } = req.body;
    if (!companyName || !contactPerson || !email)
      return res.status(400).json({ error: 'companyName, contactPerson and email are required' });
    if (!EMAIL_RE.test(email))
      return res.status(400).json({ error: 'Invalid email address' });
    const item = await Marketing.create({ companyName, contactPerson, email, phone, notes, createdBy: req.userId });
    res.status(201).json(item);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'This email already exists in your marketing list' });
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { email } = req.body;
    if (email && !EMAIL_RE.test(email))
      return res.status(400).json({ error: 'Invalid email address' });
    const item = await Marketing.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'This email already exists in your marketing list' });
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await Marketing.findOneAndDelete({ _id: req.params.id, createdBy: req.userId });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
