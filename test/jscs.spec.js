var notRequired = [
  'cache',
  'conf',
  'images',
  'internal',
  'logs',
  'messages',
  'node_modules'
];
var testPath = './';
var fs = require('fs');
var Promise = require('bluebird');
var mochaJscs = require('mocha-jscs');

var readDirPromised = Promise.promisify(fs.readdir);

readDirPromised(testPath)
    .then(
        function filterRequiredDirectories (files) {
          // Filter all folders from the directory
          var folders = [];
          files.forEach(function checkIfFolder (curr) {
            if ((/^\./).test(curr)) { // Check if the file starts with a dot, because then it shouldn't be checked
              return false;
            }

            var stat = fs.lstatSync(testPath + '/' + curr);
            if (stat.isDirectory() || curr.match(/\.(js)$/)) {
              folders.push(curr);
            }
          });

          // Filter the folders who are required for mocha-jscs
          return folders.filter(function checkIfRequired (folder) {
            return notRequired.indexOf(folder) === -1;
          });
        })
    .then(
        function runTestsForFolders (testFolders) {
          mochaJscs(testFolders);
        })
    .catch(function printError (error) {
      console.error(error);
    });
