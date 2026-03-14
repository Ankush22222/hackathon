const mongoose = require('mongoose');

const ReceiptSchema = new mongoose.Schema({
  referenceNumber: { type: String, unique: true },
  supplier: { type: String, required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      expectedQty: { type: Number, required: true },
      receivedQty: { type: Number, default: 0 },
    },
  ],
  status: {
    type: String,
    enum: ['draft', 'waiting', 'ready', 'done', 'cancelled'],
    default: 'draft',
  },
  notes: { type: String },
}, { timestamps: true });

ReceiptSchema.pre('save', function (next) {
  if (!this.referenceNumber) {
    this.referenceNumber = 'REC-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Receipt', ReceiptSchema);
