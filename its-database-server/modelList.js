const mongoose = require('mongoose');

const ModelListSchema = new mongoose.Schema({
  type: { type: String, default: 'deviceModels', unique: true },
  modelsByDeviceType: {
    type: Map,
    of: [String]
  }
});

module.exports = mongoose.model('ModelList', ModelListSchema);