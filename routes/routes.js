const express = require('express');
const router = express.Router();

const item_controller = require('../controllers/itemsController');
const category_controller = require('../controllers/categoryController');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
require('dotenv').config();
const MongoDBKey = process.env.MONGODB_KEY;

const url = `mongodb+srv://admin:${MongoDBKey}@cluster0.lnrds0m.mongodb.net/inventory_application?retryWrites=true&w=majority`;

const storage = new GridFsStorage({
  url,
  file: (req, file) => {
    //If it is an image, save to photos bucket
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      return {
        bucketName: 'photos',
        filename: `${Date.now()}_${file.originalname}`,
      };
    } else {
      //Otherwise save to default bucket
      return `${Date.now()}_${file.originalname}`;
    }
  },
});

var upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == 'image/png' ||
      file.mimetype == 'image/jpg' ||
      file.mimetype == 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  },
});

// items
router.get('/', item_controller.index);
router.get('/item/create', item_controller.item_create_get);
router.post(
  '/item/create',
  upload.single('uploaded_file'),
  item_controller.item_create_post
);
router.get('/item/:id/delete', item_controller.item_delete_get);
router.post('/item/:id/delete', item_controller.item_delete_post);
router.get('/item/:id/update', item_controller.item_update_get);
router.post('/item/:id/update', item_controller.item_update_post);
router.get('/item/:id', item_controller.item_detail);
router.get('/items', item_controller.items_list);

// category
router.get('/category/create', category_controller.category_create_get);
router.post(
  '/category/create',
  upload.single('photos'),
  category_controller.category_create_post
);
router.get('/category/:id/delete', category_controller.category_delete_get);
router.post('/category/:id/delete', category_controller.category_delete_post);
router.get('/category/:id/update', category_controller.category_update_get);
router.post('/category/:id/update', category_controller.category_update_post);
router.get('/category/:id', category_controller.category_detail);
router.get('/categories', category_controller.categories_list);

module.exports = router;
