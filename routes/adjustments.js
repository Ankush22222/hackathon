const router = require('express').Router();
const auth = require('../middleware/auth');
const Adjustment = require('../models/Adjustment');
const Product = require('../models/Product');
const StockLedger = require('../models/StockLedger');

router.get('/', auth, async (req, res) => {
  try {
    const adjustments = await Adjustment.find()
      .populate('warehouse', 'name')
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 });
    res.json(adjustments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const adjustment = new Adjustment(req.body);

    // Calculate differences
    for (const item of adjustment.items) {
      const product = await Product.findById(item.product);
      const stockEntry = product?.stock.find(
        (s) => s.warehouse.toString() === req.body.warehouse.toString()
      );
      item.recordedQty = stockEntry ? stockEntry.quantity : 0;
      item.difference = item.countedQty - item.recordedQty;
    }

    await adjustment.save();
    res.status(201).json(adjustment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// VALIDATE adjustment
router.post('/:id/validate', auth, async (req, res) => {
  try {
    const adjustment = await Adjustment.findById(req.params.id);
    if (!adjustment) return res.status(404).json({ message: 'Not found' });

    for (const item of adjustment.items) {
      const product = await Product.findById(item.product);
      const stockIdx = product.stock.findIndex(
        (s) => s.warehouse.toString() === adjustment.warehouse.toString()
      );

      if (stockIdx >= 0) {
        product.stock[stockIdx].quantity = item.countedQty;
      } else {
        product.stock.push({
          warehouse: adjustment.warehouse,
          quantity: item.countedQty,
        });
      }

      await product.save();

      await StockLedger.create({
        product: item.product, warehouse: adjustment.warehouse,
        type: 'adjustment', quantity: item.difference,
        referenceDoc: adjustment.referenceNumber, performedBy: req.user._id,
      });
    }

    adjustment.status = 'done';
    await adjustment.save();
    res.json(adjustment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
