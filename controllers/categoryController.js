const Category = require('../models/category');
const Item = require('../models/item');
const asyncHandler = require('express-async-handler');

const { body, validationResult } = require('express-validator');

exports.categories_list = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find().exec();
  res.render('categories_list', {
    categories: allCategories,
  });
});

exports.category_detail = asyncHandler(async (req, res, next) => {
  const [category, itemsInCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }).exec(),
  ]);

  if (category === null) {
    // No results.
    const err = new Error('Category not found');
    err.status = 404;
    return next(err);
  }

  res.render('category_detail', {
    category: category,
    category_items: itemsInCategory,
  });
});

// Display category create form on GET.
exports.category_create_get = asyncHandler(async (req, res, next) => {
  res.render('category_form', {
    title: 'Create category',
  });
});

exports.category_create_post = [
  // Validate and sanitize fields.
  body('name', 'Name must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('description', 'Description must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a category object with escaped and trimmed data.
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      res.render('category_form', {
        title: 'Create category',
        category: category,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Save category.
      await category.save();
      res.redirect(category.url);
    }
  }),
];

exports.category_delete_get = asyncHandler(async (req, res, next) => {
  const [category, itemsInCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }),
  ]);

  if (category === null) {
    // No results.
    res.redirect('/categories');
  }

  res.render('category_delete', {
    title: 'Delete Category',
    category: category,
    category_items: itemsInCategory,
  });
});

exports.category_delete_post = asyncHandler(async (req, res, next) => {
  const [category, itemsInCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }),
  ]);

  if (itemsInCategory.length > 0) {
    res.render('category_delete', {
      title: 'Delete Category',
      category: category,
      category_items: itemsInCategory,
    });
    return;
  }
  await Category.findByIdAndRemove(req.body.id);
  res.redirect('/categories');
});

exports.category_update_get = asyncHandler(async (req, res, render) => {
  const category = await Promise.all([Category.findById(req.params.id).exec()]);
  if (category === null) {
    const err = new Error('Category not found');
    err.status = 404;
    return next(err);
  }

  res.render('category_form', {
    title: 'Update category',
    category: category,
  });
});

exports.category_update_post = asyncHandler(async (req, res, next) => {
  body('name', 'Category needs a name').trim().isLength({ min: 1 }).escape();
  body('description', 'Category needs a description')
    .trim()
    .isLength({ min: 1 })
    .escape();

  const category = new Category({
    name: req.body.name,
    description: req.body.description,
    _id: req.params.id,
  });

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('category_form', {
      title: 'Update category',
      category: category,
      errors: errors.array(),
    });
    return;
  } else {
    const newCategory = await Category.findByIdAndUpdate(
      req.params.id,
      category,
      {}
    );
  }
});
