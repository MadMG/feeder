module.exports = function (req, res, next) {
  req.apiOptions = {
    prettyPrint: req.query.pretty || false
  };

  next();
};
