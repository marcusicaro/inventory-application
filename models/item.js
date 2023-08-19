const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemsSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: [{ type: Schema.Types.ObjectId, ref: 'Category', required: true }],
  price: { type: Number, required: true },
});

ItemsSchema.virtual('url').get(function () {
  return `/item/${this._id}`;
});

module.exports = mongoose.model('Item', ItemsSchema);
