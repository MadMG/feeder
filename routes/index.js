const express = require('express');
const router = express.Router();
const dataSource = require('../data/menu');
const moment = require('moment');
const writeResponse = require('../helper/response-writer');

router.get('/today', function (req, res) {
  resolveDate(req, res, moment().format('YYYY-MM-DD'));
});

router.post('/today', function (req, res) {
  const body = req.body;
  const raw = body.raw || false;
  const data = body.data;
  const today = moment().format('YYYY-MM-DD');
  let parsedData;

  if (data) {
    if (raw) {
      // parse the thing
      parsedData = {};
      data.split('<br>').forEach(function (line) {
        if (line.toLowerCase().indexOf('suppe') !== -1) {
          parsedData.soup = line.trim();
        } else {
          const idx = line.indexOf('€');

          if (idx !== -1) {
            parsedData.special = line.substring(0, idx).trim();
          }
        }
      });

    } else {
      parsedData = data || {};
    }

    dataSource.get(today)
        .then(function (data) {
          if (parsedData.soup) {
            data.soup = parsedData.soup;
          }

          if (parsedData.special) {
            data.special = parsedData.special;
          }

          writeResponse(res, data, true);
        })
        .catch(function (err) {
          writeResponse(res, err, true, err.status || 404);
        });

  } else {
    writeResponse(res, {status: 401, message: 'no data'}, 401);
  }

});

router.param('date', function (req, res, next, date) {
  req.apiParameter = req.apiParameter || {};
  req.apiParameter.date = date;
  next();
});

router.param('week', function (req, res, next, week) {
  req.apiParameter = req.apiParameter || {};
  req.apiParameter.week = parseInt(week, 10);
  next();
});

router.get('/week/:week', function (req, res) {
  if (req.apiParameter && req.apiParameter.week) {
    resolveWeek(req, res, req.apiParameter.week);
  } else {
    writeResponse(res, {message: 'invalid parameter'}, req.apiOptions.prettyPrint, 400);
  }
});

function resolveWeek (req, res, week) {
  const prettyPrint = req.apiOptions.prettyPrint;

  dataSource.getWeek(week)
    .then(function (data) {
      writeResponse(res, data, prettyPrint);
    })
    .catch(function (err) {
      writeResponse(res, err, prettyPrint, err.status || 404);
    });
}

function resolveDate (req, res, date) {
  const prettyPrint = req.apiOptions.prettyPrint;

  dataSource.get(date)
      .then(function (data) {
        writeResponse(res, data, prettyPrint);
      })
      .catch(function (err) {
        writeResponse(res, err, prettyPrint, err.status || 404);
      });
}

router.get('/:date', function (req, res) {
  if (req.apiParameter && req.apiParameter.date) {
    resolveDate(req, res, req.apiParameter.date);
  } else {
    writeResponse(res, {message: 'invalid parameter'}, req.apiOptions.prettyPrint, 400);
  }
});

router.get('/', function (req, res) {
  const prettyPrint = req.apiOptions.prettyPrint;

  dataSource.getCurrentWeek()
      .then(function (data) {
        writeResponse(res, data, prettyPrint);
      }, function (err) {
        const responseData = {
          message: err.message || 'error'
        };

        writeResponse(res, responseData, prettyPrint, err.status || 501);
      });
});

module.exports = router;
