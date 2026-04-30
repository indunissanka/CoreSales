const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coresales';

app.use(cors());
app.use(express.json());

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/reports',   require('./routes/reports'));
app.use('/api/contacts',  require('./routes/contacts'));
app.use('/api/products',  require('./routes/products'));
app.use('/api/orders',    require('./routes/orders'));
app.use('/api/pi',        require('./routes/proformaInvoices'));
app.use('/api/lc',        require('./routes/letterOfCredits'));
app.use('/api/forecasts', require('./routes/forecasts'));
app.use('/api/currency',  require('./routes/currency'));
app.use('/api/meetings',  require('./routes/meetings'));
app.use('/api/settings',  require('./routes/settings'));
app.use('/api/samples',   require('./routes/samples'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

let retries = 5;
const connect = () => {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
    })
    .catch(err => {
      if (retries-- > 0) {
        console.log(`MongoDB not ready, retrying in 5s... (${retries} left)`);
        setTimeout(connect, 5000);
      } else {
        console.error('Could not connect to MongoDB:', err.message);
        process.exit(1);
      }
    });
};

connect();
