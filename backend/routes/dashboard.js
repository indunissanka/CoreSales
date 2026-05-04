const express  = require('express');
const router   = express.Router();
const auth     = require('../middleware/auth');
const mongoose = require('mongoose');

const Order    = require('../models/Order');
const Contact  = require('../models/Contact');
const Product  = require('../models/Product');
const Sample   = require('../models/Sample');
const Forecast = require('../models/Forecast');
const Meeting  = require('../models/Meeting');
const Report   = require('../models/Report');

router.get('/', auth, async (req, res) => {
  try {
    const uid = req.userId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear  = new Date(now.getFullYear(), 0, 1);

    const [
      totalContacts,
      totalProducts,
      orders,
      samples,
      forecasts,
      meetings,
      reports,
      lcs,
    ] = await Promise.all([
      Contact.countDocuments({ createdBy: uid }),
      Product.countDocuments({ createdBy: uid }),
      Order.find({ createdBy: uid }).populate('contact','company').populate('items.product','name'),
      Sample.find({ createdBy: uid }).populate('company','company'),
      Forecast.find({ createdBy: uid, year: now.getFullYear() }),
      Meeting.find({ createdBy: uid }).sort({ date: -1 }),
      Report.find({ userId: uid }).sort({ weekStart: -1 }),
      require('../models/LetterOfCredit').find({ createdBy: uid }),
    ]);

    // Orders summary
    const orderStatusCounts = {};
    let totalRevenue = 0, monthRevenue = 0;
    for (const o of orders) {
      orderStatusCounts[o.status] = (orderStatusCounts[o.status] || 0) + 1;
      if (!['Cancelled','Rejected'].includes(o.status)) {
        totalRevenue += o.totalAmount || 0;
        if (new Date(o.createdAt) >= startOfMonth) monthRevenue += o.totalAmount || 0;
      }
    }
    const activeOrders = orders.filter(o => !['Cancelled','Rejected','Delivered'].includes(o.status));
    const recentOrders = orders.slice(0, 5).map(o => ({
      _id: o._id, orderNo: o.orderNo, company: o.contact?.company || '—',
      status: o.status, total: o.totalAmount, currency: o.currency, createdAt: o.createdAt,
    }));

    // Samples summary
    const sampleStatusCounts = {};
    for (const s of samples) sampleStatusCounts[s.status] = (sampleStatusCounts[s.status] || 0) + 1;

    // Forecast summary
    let forecastTotal = 0, actualTotal = 0;
    for (const f of forecasts) { forecastTotal += f.forecastQty || 0; actualTotal += f.actualQty || 0; }

    // Meetings: upcoming (next 7 days) and recent
    const in7Days = new Date(now.getTime() + 7*24*60*60*1000);
    const upcomingMeetings = meetings
      .filter(m => new Date(m.date) >= now && new Date(m.date) <= in7Days && m.status === 'Scheduled')
      .slice(0, 5)
      .map(m => ({ _id: m._id, title: m.title, date: m.date, type: m.type, status: m.status }));

    // LC summary
    const lcStatusCounts = {};
    for (const lc of lcs) lcStatusCounts[lc.status] = (lcStatusCounts[lc.status] || 0) + 1;
    const expiringLCs = lcs.filter(lc => {
      if (!lc.expiryDate || lc.status === 'Closed') return false;
      const diff = (new Date(lc.expiryDate) - now) / (1000*60*60*24);
      return diff >= 0 && diff <= 30;
    }).length;

    res.json({
      contacts:  { total: totalContacts },
      products:  { total: totalProducts },
      orders: {
        total: orders.length, active: activeOrders.length,
        statusCounts: orderStatusCounts,
        totalRevenue, monthRevenue,
        recent: recentOrders,
      },
      samples:   { total: samples.length, statusCounts: sampleStatusCounts },
      forecast:  { forecastTotal, actualTotal, entryCount: forecasts.length },
      meetings:  { total: meetings.length, upcoming: upcomingMeetings },
      reports:   { total: reports.length, latest: reports[0] || null },
      tradeDocs: { total: lcs.length, statusCounts: lcStatusCounts, expiringLCs },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
