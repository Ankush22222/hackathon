const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/receipts', require('./routes/receipts'));
app.use('/api/deliveries', require('./routes/deliveries'));
app.use('/api/transfers', require('./routes/transfers'));
app.use('/api/adjustments', require('./routes/adjustments'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Warehouse CRUD (simple)
const Warehouse = require('./models/Warehouse');
const auth = require('./middleware/auth');
app.get('/api/warehouses', auth, async (req, res) => {
  res.json(await Warehouse.find());
});
app.post('/api/warehouses', auth, async (req, res) => {
  const wh = new Warehouse(req.body);
  await wh.save();
  res.status(201).json(wh);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
