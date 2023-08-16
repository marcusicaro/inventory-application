const Item = require('../models/item');
const Category = require('../models/category');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const { title } = require('process');

exports.items_list = asyncHandler(async (req, res, next) => {
  const allItems = await Item.find({})
    .sort({ name: 1 })
    .populate('category')
    .exec();

  res.render('items_list', { title: 'Items List', items_list: allItems });
});

exports.item_detail = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id)
    .sort({ name: 1 })
    .populate('category')
    .exec();

  if (item === null) {
    // No results.
    const err = new Error('Item not found');
    err.status = 404;
    return next(err);
  }

  res.render('item_detail', {
    name: item.name,
    item: item,
  });
});

exports.item_create_get = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find({}).sort({ name: 1 }).exec();

  res.render('category_form', {
    title: 'Create item',
    categories: allCategories,
  });
});

exports.item_create_post = asyncHandler(async (req, res, next) => {
  body('name', 'Name must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('category.*').escape(),
    body('price')
      .notEmpty()
      .withMessage('Summary must not be empty.')
      .isFloat({ min: 1 })
      .withMessage('Price must be greater than 1.')
      .trim()
      .escape(),
    body('description', 'Category must not be empty.')
      .trim()
      .isLength({ min: 1 })
      .escape();

  const errors = validationResult(req);

  const item = new Item({
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    price: req.body.price,
    url: req.body.name.toLowerCase().replaceAll(' ', ''),
  });

  if (!errors.isEmpty()) {
    const allCategories = await Category.find({}).sort({ name: 1 }).exec();

    for (const category of allCategories) {
      if (item.category.indexOf(category) > -1) {
        category.checked = 'true';
      }
    }

    res.render('category_form', {
      title: 'Create item',
      categories: allCategories,
      item: item,
      errors: errors.array(),
    });
  } else {
    await item.save();
    res.redirect(item.url);
  }
});
