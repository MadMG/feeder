module.exports = function writeResponse (res, responseData, prettyPrint, httpStatus) {
  if (httpStatus) {
    res.status(httpStatus);
  }

  if (prettyPrint) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(responseData, null, 2));
  } else {
    res.json(responseData);
  }
};