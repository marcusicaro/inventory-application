const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemsSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true },
});

itemsSchema.virtual('url').get(function () {
  return `/elements/${this._id}`;
});

module.exports = mongoose.model('Item', itemsSchema);
