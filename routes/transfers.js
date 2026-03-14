const router = require('express').Router();
const auth = require('../middleware/auth');
const Transfer = require('../models/Transfer');
const Product = require('../models/Product');
const StockLedger = require('../models/StockLedger');

router.get('/', auth, async (req, res) => {
  try {
    const transfers = await Transfer.find()
      .populate('fromWarehouse toWarehouse', 'name')
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 });
    res.json(transfers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const transfer = new Transfer(req.body);
    await transfer.save();
    res.status(201).json(transfer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// VALIDATE transfer
router.post('/:id/validate', auth, async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);
    if (!transfer) return res.status(404).json({ message: 'Not found' });
    if (transfer.status === 'done') return res.status(400).json({ message: 'Already done' });

    for (const item of transfer.items) {
      const product = await Product.findById(item.product);

      // Decrease from source
      const fromIdx = product.stock.findIndex(
        (s) => s.warehouse.toString() === transfer.fromWarehouse.toString()
      );
      if (fromIdx < 0 || product.stock[fromIdx].quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      product.stock[fromIdx].quantity -= item.quantity;

      // Increase at destination
      const toIdx = product.stock.findIndex(
        (s) => s.warehouse.toString() === transfer.toWarehouse.toString()
      );
      if (toIdx >= 0) {
        product.stock[toIdx].quantity += item.quantity;
      } else {
        product.stock.push({
          warehouse: transfer.toWarehouse,
          location: transfer.toLocation,
          quantity: item.quantity,
        });
      }

      await product.save();

      // Two ledger entries
      await StockLedger.create({
        product: item.product, warehouse: transfer.fromWarehouse,
        type: 'transfer-out', quantity: -item.quantity,
        referenceDoc: transfer.referenceNumber, performedBy: req.user._id,
      });
      await StockLedger.create({
        product: item.product, warehouse: transfer.toWarehouse,
        type: 'transfer-in', quantity: item.quantity,
        referenceDoc: transfer.referenceNumber, performedBy: req.user._id,
      });
    }

    transfer.status = 'done';
    await transfer.save();
    res.json(transfer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
