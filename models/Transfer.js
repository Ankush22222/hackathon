const mongoose = require('mongoose');

const TransferSchema = new mongoose.Schema({
  referenceNumber: { type: String, unique: true },
  fromWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  fromLocation: { type: String },
  toWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  toLocation: { type: String },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
    },
  ],
  status: {
    type: String,
    enum: ['draft', 'waiting', 'done', 'cancelled'],
    default: 'draft',
  },
}, { timestamps: true });

TransferSchema.pre('save', function (next) {
  if (!this.referenceNumber) {
    this.referenceNumber = 'TRF-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Transfer', TransferSchema);
