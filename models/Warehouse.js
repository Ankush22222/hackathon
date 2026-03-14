const mongoose = require('mongoose');

const WarehouseSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  address: { type: String },
  locations: [{ type: String }], // e.g., ["Rack A", "Rack B", "Production Floor"]
}, { timestamps: true });

module.exports = mongoose.model('Warehouse', WarehouseSchema);
