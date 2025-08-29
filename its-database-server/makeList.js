const mongoose = require('mongoose');

const MakeListSchema = new mongoose.Schema({
  type: { type: String, default: 'deviceMakes', unique: true },
  makesByDeviceType: {type: Map, of: [String] }
});

module.exports = mongoose.model('MakeList', MakeListSchema);
