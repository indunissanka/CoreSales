const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');

router.use(auth);

router.get('/', async (req, res) => {
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
          orderDate:       (() => { const m = (o.orderNo||'').match(/(\d{4})(\d{2})(\d{2})/); return m ? new Date(`${m[1]}-${m[2]}-${m[3]}`) : o.createdAt; })(),
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

router.get('/csv', async (req, res) => {
  try {
    const filter = { createdBy: req.userId };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.contactId) filter.contact = req.query.contactId;
    const orders = await Order.find(filter)
      .populate('contact', 'company name')
      .populate('items.product', 'name sku')
      .sort({ orderNo: -1 });
    const esc = v => {
      const s = String(v == null ? '' : v);
      return s.includes(',') || s.includes('"') || s.includes('\n') ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const fmtDate = d => d ? new Date(d).toISOString().slice(0, 10) : '';
    const headers = ['Company','Order No','Quotation No','Order Status','Date','Product','SKU','Qty','Unit','Unit Price','Drums Price','Bank Charge','Shipping','Commission','Unit Total','Line Total','Currency'];
    let csv = headers.join(',') + '\n';
    for (const o of orders) {
      for (const item of o.items) {
        const date = (() => { const m = (o.orderNo||'').match(/(\d{4})(\d{2})(\d{2})/); return m ? `${m[1]}-${m[2]}-${m[3]}` : ''; })();
        csv += [
          esc(o.contact?.company || o.contact?.name || '—'),
          esc(o.orderNo), esc(o.quotationNo||''), esc(o.status), date,
          esc(item.product?.name || '—'), esc(item.product?.sku || ''),
          item.quantity, esc(item.unit),
          item.unitPrice, item.drumsPrice||0, item.bankCharge||0,
          item.shipping||0, item.commission||0,
          item.unitTotal, item.lineTotal, esc(o.currency||'USD'),
        ].join(',') + '\n';
      }
    }
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="pricing.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
