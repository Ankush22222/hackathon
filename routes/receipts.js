const router = require('express').Router();
const auth = require('../middleware/auth');
const Receipt = require('../models/Receipt');
const Product = require('../models/Product');
const StockLedger = require('../models/StockLedger');

// GET all receipts
router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const receipts = await Receipt.find(filter)
      .populate('warehouse', 'name')
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 });
    res.json(receipts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE receipt
router.post('/', auth, async (req, res) => {
  try {
    const receipt = new Receipt(req.body);
    await receipt.save();
    res.status(201).json(receipt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// VALIDATE receipt (status → done, stock increases)
router.post('/:id/validate', auth, async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) return res.status(404).json({ message: 'Receipt not found' });
    if (receipt.status === 'done') return res.status(400).json({ message: 'Already validated' });

    for (const item of receipt.items) {
      const product = await Product.findById(item.product);
      if (!product) continue;

      // Find or create stock entry for this warehouse
      const stockIdx = product.stock.findIndex(
        (s) => s.warehouse.toString() === receipt.warehouse.toString()
      );

      if (stockIdx >= 0) {
        product.stock[stockIdx].quantity += item.receivedQty || item.expectedQty;
      } else {
        product.stock.push({
          warehouse: receipt.warehouse,
          quantity: item.receivedQty || item.expectedQty,
        });
      }

      await product.save();

      // Log to ledger
      await StockLedger.create({
        product: item.product,
        warehouse: receipt.warehouse,
        type: 'receipt',
        quantity: item.receivedQty || item.expectedQty,
        referenceDoc: receipt.referenceNumber,
        balanceAfter: product.stock.reduce((s, e) => s + e.quantity, 0),
        performedBy: req.user._id,
      });
    }

    receipt.status = 'done';
    await receipt.save();
    res.json(receipt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
