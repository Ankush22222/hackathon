const router = require('express').Router();
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const Receipt = require('../models/Receipt');
const Delivery = require('../models/Delivery');
const Transfer = require('../models/Transfer');
const StockLedger = require('../models/StockLedger');

router.get('/', auth, async (req, res) => {
  try {
    const products = await Product.find();
    const totalProducts = products.length;
    const lowStock = products.filter((p) => {
      const total = p.stock.reduce((s, e) => s + e.quantity, 0);
      return total > 0 && total <= p.reorderLevel;
    }).length;
    const outOfStock = products.filter((p) => {
      const total = p.stock.reduce((s, e) => s + e.quantity, 0);
      return total === 0;
    }).length;

    const pendingReceipts = await Receipt.countDocuments({ status: { $in: ['draft', 'waiting', 'ready'] } });
    const pendingDeliveries = await Delivery.countDocuments({ status: { $in: ['draft', 'picking', 'packing'] } });
    const pendingTransfers = await Transfer.countDocuments({ status: { $in: ['draft', 'waiting'] } });

    res.json({
      totalProducts, lowStock, outOfStock,
      pendingReceipts, pendingDeliveries, pendingTransfers,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Move history
router.get('/ledger', auth, async (req, res) => {
  try {
    const { product, type } = req.query;
    const filter = {};
    if (product) filter.product = product;
    if (type) filter.type = type;

    const ledger = await StockLedger.find(filter)
      .populate('product', 'name sku')
      .populate('warehouse', 'name')
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(ledger);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
