const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemsSchema = newSchema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true },
  url: { type: String, required: true },
});
