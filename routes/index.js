var express = require('express');
var router = express.Router();
var dataSource = require('../data/menu');
var moment = require('moment');

/* GET home page. */
router.use(function (req, res, next) {
  req.apiOptions = {
    prettyPrint: req.query.pretty || false
  };

  next();
});

router.get('/today', function (req, res) {
  resolveDate(req, res, moment().format('YYYY-MM-DD'));
});

router.param('date', function (req, res, next, date) {
  req.apiParameter = req.apiParameter || {};
  req.apiParameter.date = date;
  next();
});

function resolveDate (req, res, date) {
  var prettyPrint = req.apiOptions.prettyPrint;

  dataSource.get(date)
      .then(function (data) {
        writeResponse(res, data, prettyPrint);
      })
      .catch(function (err) {
        writeResponse(res, err, prettyPrint, err.status || 404);
      })
}

router.get('/:date', function (req, res) {
  if (req.apiParameter && req.apiParameter.date) {
    resolveDate(req, res, req.apiParameter.date);
  } else {
    writeResponse(res, {message: 'invalid parameter'}, prettyPrint, 400);
  }
});

router.get('/', function (req, res) {
  var prettyPrint = req.apiOptions.prettyPrint;

  dataSource.getAll()
      .then(function (data) {
        writeResponse(res, data, prettyPrint);
      }, function (err) {
        var responseData = {
          message: err.message || 'error'
        };

        writeResponse(res, responseData, prettyPrint, err.status || 501);
      });
});


function writeResponse (res, responseData, prettyPrint, httpStatus) {
  if (httpStatus) {
    res.status(httpStatus);
  }

  if (prettyPrint) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(responseData, null, 2));
  } else {
    res.json(responseData);
  }
}

module.exports = router;
