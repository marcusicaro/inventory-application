const Item = require('../models/item');
const Category = require('../models/category');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const { title } = require('process');

exports.index = asyncHandler(async (req, res, next) => {
  // Get details of books, book instances, authors and genre counts (in parallel)
  console.log("aqui")
  const [numItems, numCategories] = await Promise.all([
    Item.countDocuments({}).exec(),
    Category.countDocuments({}).exec(),
  ]);


  res.render('index', {
    title: 'Local Library Home',
    item_count: numItems,
    category_count: numCategories,
  });
});

exports.items_list = asyncHandler(async (req, res, next) => {
  const allItems = await Item.find({})
    .sort({ name: 1 })
    .populate('category')
    .exec();

  res.render('item_list', { title: 'Items List', item_list: allItems });
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

  res.render('item_form', {
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
      .isNumeric()
      .withMessage('Price must be a number')
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

exports.item_delete_get = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id)
    .sort({ name: 1 })
    .populate('category')
    .exec();

  if (item === null) {
    res.redirect('/items');
  }

  res.render('item_delete', {
    title: 'Delete Item',
    item: item,
  });
});

exports.item_delete_post = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).populate('category').exec();

  if (item === null) {
    res.redirect('/items');
  } else {
    await Item.findByIdAndDelete(req.body.id);
    res.redirect('/items');
  }
});

exports.item_update_get = asyncHandler(async (req, res, next) => {
  const [item, allCategories] = await Promise.all([
    Item.findById(req.params.id).populate('category').exec(),
    Category.find().exec(),
  ]);

  if (item === null) {
    const err = new Error('Item not found');
    err.status = 404;
    return next(err);
  }

  for (const category of allCategories) {
    for (const item_category of item.category) {
      if (category._id.toString() === item_category._id.toString()) {
        category.checked = 'true';
      }
    }
  }

  res.render('item_form', {
    title: 'Update Item',
    categories: allCategories,
    item: item,
  });
});

exports.item_update_post = asyncHandler(async (req, res, next) => {
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
    _id: req.params.id,
  });

  if (!errors.isEmpty()) {
    const allCategories = await Category.find().exec();

    for (const category of allCategories) {
      if (item.category.indexOf(category._id) > -1) {
        category.checked = 'true';
      }
    }

    res.render('item_form', {
      title: 'Update Category',
      categories: allCategories,
      item: item,
      errors: errors.array(),
    });
    return;
  } else {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, item, {});
    res.redirect(updatedItem.url);
  }
});
