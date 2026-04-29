const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const { generateOrderNo } = require('../utils/autoNumber');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { status, contactId } = req.query;
    const filter = { createdBy: req.userId };
    if (status) filter.status = status;
    if (contactId) filter.contact = contactId;
    const orders = await Order.find(filter)
      .populate('contact', 'company name')
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, createdBy: req.userId })
      .populate('contact')
      .populate('items.product');
    if (!order) return res.status(404).json({ error: 'Not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const orderNo = await generateOrderNo();
    const items = (req.body.items || []).map(item => ({
      ...item,
      lineTotal: item.quantity * item.unitPrice,
    }));
    const totalAmount = items.reduce((sum, i) => sum + i.lineTotal, 0);
    const order = new Order({ ...req.body, orderNo, items, totalAmount, createdBy: req.userId });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (req.body.items) {
      req.body.items = req.body.items.map(item => ({
        ...item,
        lineTotal: item.quantity * item.unitPrice,
      }));
      req.body.totalAmount = req.body.items.reduce((sum, i) => sum + i.lineTotal, 0);
    }
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.userId },
      req.body,
      { new: true, runValidators: true }
    ).populate('contact').populate('items.product');
    if (!order) return res.status(404).json({ error: 'Not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.userId },
      { status: 'Cancelled' },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
