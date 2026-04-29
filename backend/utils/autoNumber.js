const Order = () => require('../models/Order');
const ProformaInvoice = () => require('../models/ProformaInvoice');

async function generateOrderNo() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm   = String(now.getMonth() + 1).padStart(2, '0');
  const dd   = String(now.getDate()).padStart(2, '0');
  const prefix = `TC-M${yyyy}${mm}${dd}`;
  const count = await Order().countDocuments({ orderNo: new RegExp(`^${prefix}`) });
  const letter = count < 26
    ? String.fromCharCode(65 + count)
    : String.fromCharCode(65 + Math.floor(count / 26) - 1) + String.fromCharCode(65 + (count % 26));
  return `${prefix}${letter}`;
}

async function generatePINumber() {
  const year = new Date().getFullYear();
  const count = await ProformaInvoice().countDocuments({ piNumber: new RegExp(`^PI-${year}-`) });
  return `PI-${year}-${String(count + 1).padStart(4, '0')}`;
}

module.exports = { generateOrderNo, generatePINumber };
