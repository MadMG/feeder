var express = require('express');
var router = express.Router();
var writeResponse = require('../helper/response-writer');
var versionInfo = require('../package.json');

router.get('/', function (req, res) {
  var prettyPrint = req.apiOptions.prettyPrint;
  writeResponse(res, {
        name: versionInfo.name,
        version: versionInfo.version,
        description: versionInfo.description
      },
      prettyPrint);
});

module.exports = router;
