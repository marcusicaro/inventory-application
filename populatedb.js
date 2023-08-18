#! /usr/bin/env node

console.log(
  'This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/inventory_application?retryWrites=true&w=majority"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Category = require('./models/category');
const Item = require('./models/item');

const categories = [];
const items = [];

const mongoose = require('mongoose');
mongoose.set('strictQuery', false); // Prepare for Mongoose 7

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log('Debug: About to connect');
  await mongoose.connect(mongoDB);
  console.log('Debug: Should be connected?');
  await createCategories();
  await createItems();
  console.log('Debug: Closing mongoose');
  mongoose.connection.close();
}

// We pass the index to the ...Create functions so that, for example,
// genre[0] will always be the Fantasy genre, regardless of the order
// in which the elements of promise.all's argument complete.
async function categoryCreate(index, name, description, url) {
  const categorydetail = {
    name: name,
    description: description,
  };

  const category = new Category(categorydetail);
  await category.save();
  categories[index] = category;
  console.log(`Added category: ${name}`);
}

async function createCategories() {
  console.log('Adding categories');
  await Promise.all([
    categoryCreate(0, 'Soaps', 'Natural soaps.', 'soaps'),
    categoryCreate(1, 'Shampoos', 'Natural shampoos', 'shampoos'),
    categoryCreate(2, 'Skincare', 'Natural Products', 'skincare'),
  ]);
}

async function itemCreate(index, name, description, category, price, url) {
  const item = new Item({
    name: name,
    description: description,
    category: category,
    price: price,
  });
  await item.save();
  items[index] = item;
  console.log(`Added item: ${name}`);
}

async function createItems() {
  console.log('Adding items');
  await Promise.all([
    itemCreate(
      0,
      'Green soap',
      'Natural green soap',
      categories[0],
      10,
      'greensoap'
    ),
    itemCreate(
      1,
      'Chamomile soap',
      'Natural chamomile soap',
      categories[0],
      15,
      'chamomilesoap'
    ),
    itemCreate(
      2,
      'Chamomile shampoo',
      'Natural chamomile shampoo',
      categories[1],
      12,
      'chamomileshampoo'
    ),
    itemCreate(
      3,
      'Aloe vera shampoo',
      'Natural aloe vera shampoo',
      categories[1],
      13,
      'aloeverashampoo'
    ),
    itemCreate(
      4,
      'Aloe vera moisturizer',
      'Natural aloe vera moisturizer',
      categories[2],
      20,
      'aloeveramoisturizer'
    ),
  ]);
}
