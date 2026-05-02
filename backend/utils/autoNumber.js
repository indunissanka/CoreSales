const Order = () => require('../models/Order');
const ProformaInvoice = () => require('../models/ProformaInvoice');

function dateSuffix() {
  const now  = new Date();
  const yyyy = now.getFullYear();
  const mm   = String(now.getMonth() + 1).padStart(2, '0');
  const dd   = String(now.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

function letterSuffix(count) {
  return count < 26
    ? String.fromCharCode(65 + count)
    : String.fromCharCode(65 + Math.floor(count / 26) - 1) + String.fromCharCode(65 + (count % 26));
}

async function getUserPrefix(userId, field, fallback) {
  if (!userId) return fallback;
  try {
    const Settings = require('../models/Settings');
    const s = await Settings.findOne({ user: userId });
    return (s && s[field]) ? s[field] : fallback;
  } catch (_) { return fallback; }
}

async function generateOrderNo(userId) {
  const pfx    = await getUserPrefix(userId, 'orderNoPrefix', 'TC-M');
  const prefix = `${pfx}${dateSuffix()}`;
  const count  = await Order().countDocuments({ orderNo: new RegExp(`^${escapeRegex(prefix)}`) });
  return `${prefix}${letterSuffix(count)}`;
}

async function generateQuotationNo(userId) {
  const pfx    = await getUserPrefix(userId, 'quotationNoPrefix', 'QT-M');
  const prefix = `${pfx}${dateSuffix()}`;
  const count  = await Order().countDocuments({ quotationNo: new RegExp(`^${escapeRegex(prefix)}`) });
  return `${prefix}${letterSuffix(count)}`;
}

async function generatePINumber() {
  const year  = new Date().getFullYear();
  const count = await ProformaInvoice().countDocuments({ piNumber: new RegExp(`^PI-${year}-`) });
  return `PI-${year}-${String(count + 1).padStart(4, '0')}`;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { generateOrderNo, generateQuotationNo, generatePINumber };
