const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const LetterOfCredit = require('../models/LetterOfCredit');
const Order = require('../models/Order');

router.use(auth);

router.get('/alerts', async (req, res) => {
  try {
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const overdue = await LetterOfCredit.find({
      status: 'Pending',
      piDate: { $lte: fourteenDaysAgo },
    }).populate('order', 'orderNo').populate('proformaInvoice', 'piNumber');
    res.json(overdue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { createdBy: req.userId };
    if (status) filter.status = status;
    const lcs = await LetterOfCredit.find(filter)
      .populate('order', 'orderNo contact')
      .populate('proformaInvoice', 'piNumber issuedDate')
      .sort({ createdAt: -1 });
    res.json(lcs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const lc = await LetterOfCredit.findById(req.params.id)
      .populate('order')
      .populate('proformaInvoice');
    if (!lc) return res.status(404).json({ error: 'Not found' });
    res.json(lc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { orderId, piId, amount, currency, issuingBank, expiryDate, piDate } = req.body;
    const lc = new LetterOfCredit({
      order:           orderId,
      proformaInvoice: piId,
      createdBy:       req.userId,
      piDate:          piDate || new Date(),
      amount,
      currency,
      issuingBank,
      expiryDate,
    });
    await lc.save();
    await Order.findByIdAndUpdate(orderId, { letterOfCredit: lc._id, status: 'LC Opened' });
    res.status(201).json(lc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const lc = await LetterOfCredit.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!lc) return res.status(404).json({ error: 'Not found' });
    res.json(lc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
