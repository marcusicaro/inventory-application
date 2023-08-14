const Category = require('../models/category');
const asyncHandler = require('express-async-handler');

const { body, validationResult } = require('express-validator');

exports.categories_list = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find().exec();
  res.render('categories_list', {
    categories: allCategories,
  });
});
