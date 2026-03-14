const mongoose = require('mongoose');

const AdjustmentSchema = new mongoose.Schema({
  referenceNumber: { type: String, unique: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  location: { type: String },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      recordedQty: { type: Number },
      countedQty: { type: Number, required: true },
      difference: { type: Number },
    },
  ],
  reason: { type: String },
  status: {
    type: String,
    enum: ['draft', 'done', 'cancelled'],
    default: 'draft',
  },
}, { timestamps: true });

AdjustmentSchema.pre('save', function (next) {
  if (!this.referenceNumber) {
    this.referenceNumber = 'ADJ-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Adjustment', AdjustmentSchema);
