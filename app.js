require('dotenv').config();
var debug = require('debug')('http');
var morgan = require('morgan');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var app = express();
var mongoose = require('mongoose');
var userModel = require('./models/user');

const KEY = 'ForOnceTryToBeOriginal';
const signature = {
  signed: KEY,
  maxAge: 2 * 24 * 60 * 60 * 1000,
};
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};

app.use(morgan('dev'));

	mongoose.connect('mongodb+srv://abshetty:xHPl9iJDBtGc8lvQ@eattendance.oxj6e.mongodb.net/bloodbank?retryWrites=true&w=majority',{useNewUrlParser: true, useUnifiedTopology: true})

//	mongoose.connect('mongodb://localhost:27017/bloodbank',{useNewUrlParser: true, useUnifiedTopology: true})

app.use(express.static('public/js'));
app.use(express.static('public/css'));
app.use(express.static('public/img'));
app.use(express.static('public/json'));
app.use(cookieParser(KEY));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// Get Index Page Request
app.get ('/', (req, res) => {
    res.render('index');
});

app.get('/contact', (req, res, next) => {
  res.render('contact');
});

app.get('/faq', (req, res, next) => {
  res.render('faq');
});

app.get('/guidelines', (req, res, next) => {
  res.render('guidelines');
});

app.get('/center', (req, res, next) => {
  res.render('center');
});

app.post('/register', (req, res) => {
  debug(req.body);
  userModel
    .findOne({ phone: req.body.phone })
    .then((user) => {
      if (user == null) {
        new userModel({
          name: req.body.name.toUpperCase(),
          bloodGroup: req.body.blood.toUpperCase() + req.body.rh,
          city: req.body.city.toUpperCase(),
          phone: req.body.phone,
		  email: req.body.email,
          address: req.body.address,
        })
          .save()
          .then((user) => {
            res.cookie('user', user.phone, signature);
            res.redirect('/bank');
          })
          .catch((err) => {
            res.send(err.message + '\nPlease go Back and try again.');
          });
      } else {
        res.cookie('user', user.phone, signature);
        res.redirect('/bank');
      }
    })
    .catch((err) => {
      res.send(err.message);
    });
});

app.get('/bank', (req, res) => {
  if (req.query.blood == undefined || req.query.blood == '')
    req.query.blood = '(A|B|O|AB)';

  if (req.query.rh != undefined) req.query.blood += escapeRegExp(req.query.rh);
  else req.query.blood += '[\\+-]';

  if (req.query.city == undefined) req.query.city = '';

  var page = req.query.page;
  if (page === undefined || page < 1) page = 1;

  var query = {
    $and: [
      { bloodGroup: { $regex: req.query.blood, $options: 'i' } },
      { city: { $regex: req.query.city, $options: 'i' } },
    ],
  };

  userModel.find(
    query,
    null,
    {
      sort: {
        amount: -1,
      },
      limit: 18,
      skip: (page - 1) * 18,
    },
    function (err, docs) {
      if (err) res.send(err);
      res.render('bank', { docs: docs, logged: req.signedCookies.user });
    }
  );
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