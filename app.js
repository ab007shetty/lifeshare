var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

require('dotenv').config();
var debug = require('debug')('http');
var bodyParser = require('body-parser');
var morgan = require('morgan');

var app = express();

var mongoose = require('mongoose');
var userModel = require('./models/user');

const KEY = process.env.KEY;
const dburi = process.env.DBURI;
const signature = {
  signed: KEY,
  maxAge: 2 * 24 * 60 * 60 * 1000,
};
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};

app.use(morgan('dev'));

mongoose.connect('mongodb://localhost:27017/bloodbank',{useNewUrlParser: true, useUnifiedTopology: true})

app.use(express.static('public/javascripts'));
app.use(express.static('public/stylesheets'));
app.use(express.static('public/images'));
app.use(express.static('public/json'));
app.use(cookieParser(KEY));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('App listening on port ' + port + '!');
});
