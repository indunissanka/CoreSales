const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const { generateOrderNo, generateQuotationNo } = require('../utils/autoNumber');

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
      .sort({ orderNo: -1 });
    const changed = await autoAdvanceStatus(orders);
    if (changed) orders = await Order.find(filter)
      .populate('contact', 'company name')
      .populate('items.product', 'name sku')
      .sort({ orderNo: -1 });
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
      .sort({ orderNo: -1 });
    const rows = [];
    for (const o of orders) {
      for (const item of o.items) {
        rows.push({
          orderId:         o._id,
          orderNo:         o.orderNo,
          quotationNo:     o.quotationNo || '',
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
    const orderNo = await generateOrderNo(req.userId);
    res.json({ orderNo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/next-quotation-number', async (req, res) => {
  try {
    const quotationNo = await generateQuotationNo(req.userId);
    res.json({ quotationNo });
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
// Finds the highest milestone whose date has passed and advances status to it.
// Only moves forward — never touches Cancelled/Rejected/Delivered.
async function autoAdvanceStatus(orders) {
  const now = new Date();
  const STAGES = [
    'Enquiry','Quotation Sent','PI Issued','LC Opened',
    'Production','Booking','Cargo Closing','ETD (Departure)','ETA (Arrival)','Delivered',
  ];
  const MILESTONES = [
    { field: 'bookingDate',      status: 'Booking' },
    { field: 'cargoClosingDate', status: 'Cargo Closing' },
    { field: 'etd',              status: 'ETD (Departure)' },
    { field: 'eta',              status: 'ETA (Arrival)' },
    { field: 'deliveryDate',     status: 'Delivered' },
  ];
  const PRODUCTION_IDX = STAGES.indexOf('Production');
  const ops = [];
  for (const o of orders) {
    if (['Cancelled', 'Rejected', 'Delivered'].includes(o.status)) continue;
    const curIdx = STAGES.indexOf(o.status);
    if (curIdx < PRODUCTION_IDX) continue; // only auto-advance once at Production or beyond
    const ss = o.shippingSchedule || {};
    let nextStatus = null;
    for (const m of MILESTONES) {
      if (ss[m.field] && new Date(ss[m.field]) <= now) nextStatus = m.status;
    }
    if (!nextStatus) continue;
    const nextIdx = STAGES.indexOf(nextStatus);
    if (nextIdx > curIdx) ops.push(Order.updateOne({ _id: o._id }, { status: nextStatus }));
  }
  if (ops.length) await Promise.all(ops);
  return ops.length > 0;
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
    const orderNo = (req.body.orderNo && req.body.orderNo.trim()) || await generateOrderNo(req.userId);
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
    const order = await Order.findOneAndDelete({ _id: req.params.id, createdBy: req.userId });
    if (!order) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/duplicate', async (req, res) => {
  try {
    const src = await Order.findOne({ _id: req.params.id, createdBy: req.userId });
    if (!src) return res.status(404).json({ error: 'Not found' });
    const newOrderNo = await generateOrderNo(req.userId);
    const { _id, orderNo, quotationNo, createdAt, updatedAt, proformaInvoice, letterOfCredit, ...rest } = src.toObject();
    const copy = new Order({
      ...rest,
      orderNo: newOrderNo,
      status: 'Enquiry',
      shippingSchedule: {},
      createdBy: req.userId,
    });
    await copy.save();
    res.status(201).json(copy);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
module.exports.autoAdvanceOrderStatus = autoAdvanceStatus;
