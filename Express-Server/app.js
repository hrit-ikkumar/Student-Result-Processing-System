var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var passport = require('passport');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const uploadRouter = require('./routes/uploadRouter');

var departmentRouter = require('./routes/departmentRouter');
var courseRouter = require('./routes/courseRouter');
var markRouter = require('./routes/markRouter');
var resultRouter = require('./routes/resultRouter');

const mongoose = require('mongoose');

var config = require('./config');

const url = config.mongoUrl;
const connect = mongoose.connect(url);
var database;
connect.then((db) => {
  database = db;
    console.log("Connected correctly to server");
}, (err) => { console.log(err); });

var app = express();
// Secure traffic only
app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  }
  else {
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
  }
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(passport.initialize());
app.use(passport.session());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/imageUpload', uploadRouter);

app.use('/departments', departmentRouter);
app.use('/courses', courseRouter);
app.use('/marks', markRouter);
app.use('/results', resultRouter);

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

module.exports = app;
