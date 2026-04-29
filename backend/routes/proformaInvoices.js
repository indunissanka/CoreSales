const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ProformaInvoice = require('../models/ProformaInvoice');
const Order = require('../models/Order');
const { generatePINumber } = require('../utils/autoNumber');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const pis = await ProformaInvoice.find({ issuedBy: req.userId })
      .populate('order', 'orderNo contact')
      .sort({ createdAt: -1 });
    res.json(pis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const pi = await ProformaInvoice.findById(req.params.id).populate('order');
    if (!pi) return res.status(404).json({ error: 'Not found' });
    res.json(pi);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { orderId, bankDetails, sellerInfo, specialTerms, validDays = 30 } = req.body;
    const order = await Order.findOne({ _id: orderId, createdBy: req.userId })
      .populate('items.product')
      .populate('contact');
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const piNumber = await generatePINumber();
    const issuedDate = new Date();
    const validUntil = new Date(issuedDate);
    validUntil.setDate(validUntil.getDate() + Number(validDays));

    const items = order.items.map(item => ({
      productName: item.product.name,
      sku:         item.product.sku || '',
      quantity:    item.quantity,
      unit:        item.unit,
      unitPrice:   item.unitPrice,
      lineTotal:   item.lineTotal,
    }));

    const buyerInfo = [
      order.contact.company,
      order.contact.name,
      order.contact.city,
      order.contact.country,
    ].filter(Boolean).join('\n');

    const pi = new ProformaInvoice({
      piNumber,
      order:             order._id,
      issuedBy:          req.userId,
      issuedDate,
      validUntil,
      incoterm:          order.incoterm,
      portOfLoading:     order.portOfLoading,
      portOfDestination: order.portOfDestination,
      currency:          order.currency,
      items,
      bankDetails,
      sellerInfo,
      buyerInfo,
      specialTerms,
      totalAmount:       order.totalAmount,
      status:            'Draft',
    });
    await pi.save();

    order.proformaInvoice = pi._id;
    order.status = 'PI Issued';
    await order.save();

    res.status(201).json(pi);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const pi = await ProformaInvoice.findById(req.params.id);
    if (!pi) return res.status(404).json({ error: 'Not found' });
    if (pi.status !== 'Draft') return res.status(400).json({ error: 'Only Draft PIs can be edited' });
    Object.assign(pi, req.body);
    await pi.save();
    res.json(pi);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
