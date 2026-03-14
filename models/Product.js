const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  unitOfMeasure: { type: String, default: 'units' }, // kg, units, liters, etc.
  stock: [
    {
      warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
      location: { type: String, default: 'Default' }, // rack, shelf, etc.
      quantity: { type: Number, default: 0 },
    },
  ],
  reorderLevel: { type: Number, default: 10 },
  description: { type: String },
}, { timestamps: true });

// Virtual to get total stock across all warehouses
ProductSchema.virtual('totalStock').get(function () {
  return this.stock.reduce((sum, s) => sum + s.quantity, 0);
});

ProductSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', ProductSchema);
