const express  = require('express');
const router   = express.Router();
const auth     = require('../middleware/auth');

const Order   = require('../models/Order');
const Contact = require('../models/Contact');
const Product = require('../models/Product');
const Meeting = require('../models/Meeting');
const Note    = require('../models/Note');
const Sample  = require('../models/Sample');

router.use(auth);

router.get('/', async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.json([]);

  const uid = req.userId;
  const re  = new RegExp(q.trim(), 'i');

  try {
    const [orders, contacts, products, meetings, notes, samples] = await Promise.all([
      Order.find({
        createdBy: uid,
        $or: [{ orderNo: re }, { quotationNo: re }],
      }).populate('contact', 'company').limit(8).lean(),

      Contact.find({
        createdBy: uid,
        $or: [{ company: re }, { name: re }, { email: re }],
      }).limit(8).lean(),

      Product.find({
        createdBy: uid,
        $or: [{ name: re }, { sku: re }, { category: re }],
      }).limit(8).lean(),

      Meeting.find({
        createdBy: uid,
        $or: [{ title: re }, { notes: re }],
      }).limit(5).lean(),

      Note.find({
        createdBy: uid,
        $or: [{ title: re }, { content: re }],
      }).limit(5).lean(),

      Sample.find({
        createdBy: uid,
        $or: [{ waybillNumber: re }, { notes: re }],
      }).populate('company', 'company').limit(5).lean(),
    ]);

    const results = [
      ...orders.map(o => ({
        type: 'Order',
        id:   o._id,
        title: o.orderNo,
        sub:   o.contact?.company || '—',
        meta:  o.status,
        url:   `/order-edit.html?id=${o._id}`,
      })),
      ...contacts.map(c => ({
        type: 'Contact',
        id:   c._id,
        title: c.company || c.name,
        sub:   c.name || '',
        meta:  c.country || '',
        url:   `/contact-detail.html?id=${c._id}`,
      })),
      ...products.map(p => ({
        type: 'Product',
        id:   p._id,
        title: p.name,
        sub:   p.sku || '',
        meta:  p.category || '',
        url:   `/product-edit.html?id=${p._id}`,
      })),
      ...meetings.map(m => ({
        type: 'Meeting',
        id:   m._id,
        title: m.title,
        sub:   m.type || '',
        meta:  m.status || '',
        url:   `/meetings.html`,
      })),
      ...notes.map(n => ({
        type: 'Note',
        id:   n._id,
        title: n.title || 'Untitled Note',
        sub:   '',
        meta:  '',
        url:   `/notes.html`,
      })),
      ...samples.map(s => ({
        type: 'Sample',
        id:   s._id,
        title: s.waybillNumber || 'Sample',
        sub:   s.company?.company || '',
        meta:  s.status || '',
        url:   `/samples.html`,
      })),
    ];

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
