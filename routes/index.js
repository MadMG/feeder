var express = require('express');
var router = express.Router();
var menu = require('netzwerk111-menu');

/* GET home page. */
router.get('/menu', function (req, res, next) {
  menu.retrieve(function (err, data) {
    if (err) {
      res.status(err.status || 501);
      res.json({
        message: err.message || 'error',
        error: err
      });
    } else {
      res.json(data);
    }
  });
});

module.exports = router;
