const Order = () => require('../models/Order');
const ProformaInvoice = () => require('../models/ProformaInvoice');

async function generateOrderNo() {
  const year = new Date().getFullYear();
  const count = await Order().countDocuments({ orderNo: new RegExp(`^ORD-${year}-`) });
  return `ORD-${year}-${String(count + 1).padStart(4, '0')}`;
}

async function generatePINumber() {
  const year = new Date().getFullYear();
  const count = await ProformaInvoice().countDocuments({ piNumber: new RegExp(`^PI-${year}-`) });
  return `PI-${year}-${String(count + 1).padStart(4, '0')}`;
}

module.exports = { generateOrderNo, generatePINumber };
