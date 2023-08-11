const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categoriesSchema = newSchema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true },
});
