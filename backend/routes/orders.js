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
    let orders = await Order.find(filter)
      .populate('contact', 'company name')
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 });
    await autoAdvanceStatus(orders);
    // Re-fetch only if any statuses were updated
    orders = await Order.find(filter)
      .populate('contact', 'company name')
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/line-items', async (req, res) => {
  try {
    const filter = { createdBy: req.userId };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.contactId) filter.contact = req.query.contactId;
    const orders = await Order.find(filter)
      .populate('contact', 'company name')
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 });
    const rows = [];
    for (const o of orders) {
      for (const item of o.items) {
        rows.push({
          orderId:         o._id,
          orderNo:         o.orderNo,
          orderStatus:     o.status,
          orderDate:       o.createdAt,
          currency:        o.currency,
          company:         o.contact?.company || o.contact?.name || '—',
          contactId:       o.contact?._id,
          productId:       item.product?._id,
          productName:     item.product?.name || '—',
          sku:             item.product?.sku  || '',
          quantity:        item.quantity,
          unit:            item.unit,
          unitPrice:       item.unitPrice,
          drumsPrice:      item.drumsPrice,
          bankCharge:      item.bankCharge,
          shipping:        item.shipping,
          commission:      item.commission,
          unitTotal:       item.unitTotal,
          lineTotal:       item.lineTotal,
        });
      }
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/next-number', async (req, res) => {
  try {
    const orderNo = await generateOrderNo();
    res.json({ orderNo });
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

// Auto-advance order status based on shipping schedule dates.
// Rules (only advance, never touch Cancelled/Rejected):
//   ETD passed + status is PI Issued or LC Opened  → Shipped
//   ETA or deliveryDate passed + status is Shipped → Delivered
async function autoAdvanceStatus(orders) {
  const now = new Date();
  const ops = [];
  for (const o of orders) {
    if (['Cancelled', 'Rejected', 'Delivered'].includes(o.status)) continue;
    const ss = o.shippingSchedule || {};
    let next = null;
    if (!next && ss.etd && new Date(ss.etd) <= now && ['PI Issued', 'LC Opened'].includes(o.status)) {
      next = 'Shipped';
    }
    if (!next && o.status === 'Shipped') {
      const arrived = (ss.eta && new Date(ss.eta) <= now) || (ss.deliveryDate && new Date(ss.deliveryDate) <= now);
      if (arrived) next = 'Delivered';
    }
    if (next) ops.push(Order.updateOne({ _id: o._id }, { status: next }));
  }
  if (ops.length) await Promise.all(ops);
}

function calcItems(rawItems, body) {
  const items = (rawItems || []).map(item => {
    const unitTotal = (item.unitPrice || 0) + (item.drumsPrice || 0) + (item.bankCharge || 0) + (item.shipping || 0) + (item.commission || 0);
    return { ...item, unitTotal, lineTotal: (item.quantity || 0) * unitTotal };
  });
  const subtotal    = items.reduce((s, i) => s + i.lineTotal, 0);
  const taxEstimate = subtotal * ((body.taxRate || 0) / 100);
  const totalAmount = subtotal + (body.inspectionCharges || 0) + taxEstimate;
  return { items, subtotalAmount: subtotal, totalAmount };
}

router.post('/', async (req, res) => {
  try {
    const orderNo = (req.body.orderNo && req.body.orderNo.trim()) || await generateOrderNo();
    const { items, subtotalAmount, totalAmount } = calcItems(req.body.items, req.body);
    const order = new Order({ ...req.body, orderNo, items, subtotalAmount, totalAmount, createdBy: req.userId });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (req.body.items) {
      const { items, subtotalAmount, totalAmount } = calcItems(req.body.items, req.body);
      req.body.items          = items;
      req.body.subtotalAmount = subtotalAmount;
      req.body.totalAmount    = totalAmount;
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
