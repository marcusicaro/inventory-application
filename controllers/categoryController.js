const Category = require('../models/category');
const asyncHandler = require('express-async-handler');

const { body, validationResult } = require('express-validator');

exports.categories_list = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find().exec();
  res.render('categories_list', {
    categories: allCategories,
  });
});

exports.category_detail = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).exec();

  if (category === null) {
    // No results.
    const err = new Error('Category not found');
    err.status = 404;
    return next(err);
  }

  res.render('category_detail', {
    category: category,
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

    // Create a Book object with escaped and trimmed data.
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
      url: req.body.name.toLowerCase().replaceAll(' ', ''),
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      res.render('category_form', {
        title: 'Create category',
        category: category,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Save book.
      await category.save();
      res.redirect(category.url);
    }
  }),
];
