const mongoose = require('mongoose');

const DeliverySchema = new mongoose.Schema({
  referenceNumber: { type: String, unique: true },
  customer: { type: String, required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
    },
  ],
  status: {
    type: String,
    enum: ['draft', 'picking', 'packing', 'done', 'cancelled'],
    default: 'draft',
  },
  notes: { type: String },
}, { timestamps: true });

DeliverySchema.pre('save', function (next) {
  if (!this.referenceNumber) {
    this.referenceNumber = 'DEL-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Delivery', DeliverySchema);
