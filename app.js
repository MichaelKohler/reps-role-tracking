const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const index = require('./routes/index');
const Fetcher = require('./lib/fetcher');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
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

if (process.env.FETCH_REPS && process.env.FETCH_REPS === 'true') {
  const fetch = new Fetcher();
  fetch.fetchAll();
}

// ATTENTION: Only run this when necessary. This will fetch all new activities
// we haven't fetched yet. In any case, it will request the number of pages and
// then it will check if we already have the specific details.
if (process.env.FETCH_REPS_ACTIVITIES && process.env.FETCH_REPS_ACTIVITIES === 'true') {
  const MAX_NUMBER_OF_PAGES = 592; // 592 == 2015-09-01
  const fetch = new Fetcher();
  fetch.fetchAllActivities(MAX_NUMBER_OF_PAGES);
}

module.exports = app;
