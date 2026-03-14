const router = require('express').Router();
const auth = require('../middleware/auth');
const Delivery = require('../models/Delivery');
const Product = require('../models/Product');
const StockLedger = require('../models/StockLedger');

// GET all
router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const deliveries = await Delivery.find(filter)
      .populate('warehouse', 'name')
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 });
    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE
router.post('/', auth, async (req, res) => {
  try {
    const delivery = new Delivery(req.body);
    await delivery.save();
    res.status(201).json(delivery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// VALIDATE delivery (status → done, stock decreases)
router.post('/:id/validate', auth, async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ message: 'Not found' });
    if (delivery.status === 'done') return res.status(400).json({ message: 'Already validated' });

    for (const item of delivery.items) {
      const product = await Product.findById(item.product);
      if (!product) continue;

      const stockIdx = product.stock.findIndex(
        (s) => s.warehouse.toString() === delivery.warehouse.toString()
      );

      if (stockIdx < 0 || product.stock[stockIdx].quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`,
        });
      }

      product.stock[stockIdx].quantity -= item.quantity;
      await product.save();

      await StockLedger.create({
        product: item.product,
        warehouse: delivery.warehouse,
        type: 'delivery',
        quantity: -item.quantity,
        referenceDoc: delivery.referenceNumber,
        balanceAfter: product.stock.reduce((s, e) => s + e.quantity, 0),
        performedBy: req.user._id,
      });
    }

    delivery.status = 'done';
    await delivery.save();
    res.json(delivery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
