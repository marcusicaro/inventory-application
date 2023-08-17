const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categoriesSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true },
});

categoriesSchema.virtual('url').get(function () {
  return `/elements/${this._id}`;
});

module.exports = mongoose.model('Category', categoriesSchema);
