const debug = require('debug')('app');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
const MongoDBKey = process.env.MONGODB_KEY;
var routes = require('./routes/routes');

var app = express();

const dev_db_url = `mongodb+srv://admin:${MongoDBKey}@cluster0.lnrds0m.mongodb.net/inventory_application?retryWrites=true&w=majority`;

const mongoDB = dev_db_url;

const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

main().catch((err) => debug(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));
app.use('*/public', express.static('public/'));

app.use('*/images', express.static('public/images'));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
