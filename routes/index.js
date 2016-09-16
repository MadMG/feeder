var express = require('express');
var menu = require('netzwerk111-menu');
var Pact = require('bluebird');
var router = express.Router();

/* GET home page. */
router.use(function (req, res, next) {
  req.apiOptions = {
    prettyPrint: req.query.pretty || false
  };

  next();
});

router.get('/', function (req, res) {
  var prettyPrint = req.apiOptions.prettyPrint;

  retrieveData()
      .then(function (data) {
        writeResponse(res, data, prettyPrint);
      }, function (err) {
        var responseData = {
          message: err.message || 'error',
          error: err
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

function retrieveData () {
  return new Pact(function (resolve, reject) {
    menu.retrieve(function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

module.exports = router;
