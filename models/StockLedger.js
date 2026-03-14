const mongoose = require('mongoose');

const StockLedgerSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  location: { type: String },
  type: {
    type: String,
    enum: ['receipt', 'delivery', 'transfer-in', 'transfer-out', 'adjustment'],
    required: true,
  },
  quantity: { type: Number, required: true }, // positive = in, negative = out
  referenceDoc: { type: String }, // e.g., "REC-123456"
  balanceAfter: { type: Number },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('StockLedger', StockLedgerSchema);
