const fs = require('fs-extra');
const path = require('path');
const Pact = require('bluebird');
const moment = require('moment');

const fileRoot = 'data-files';

module.exports = {
  _createDirectoryName: function (date) {
    const d = moment(date);
    const dir = path.join(__dirname, fileRoot, '' + d.year(), '' + d.month());
    return {d, dir};
  },

  _createFilename (date) {
    const {d, dir} = this._createDirectoryName(date);
    return path.join(dir, d.week() + '.json');
  },

  hasData (date) {
    const file = this._createFilename(date);

    return new Pact((resolve, reject) => {
      fs.stat(file, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },

  readData (date) {
    const file = this._createFilename(date);

    return fs.readJson(file);
  },

  saveData (data) {
    let promises = [];

    if (Array.isArray(data)) {
      const self = this;
      let weeks = {};

      data.forEach((day) => {
        if (!weeks.hasOwnProperty(day.week)) {
          weeks[day.week] = [];
        }

        weeks[day.week].push(day);
      });

      for (const week in weeks) {
        if (weeks.hasOwnProperty(week)) {
          if (weeks[week].length > 0) {
            const file = self._createFilename(weeks[week][0].date);

            promises.push(self._fileWriter(file, weeks[week]));
          }
        }
      }
    }

    return promises.length > 0 ? Pact.all(promises)
        .then(() => {
          return data;
        }) : Pact.resolve(data);
  },

  _fileWriter (file, data) {
    return fs.ensureFile(file)
        .then(() => {
          return fs.writeJson(file, data, {spaces: 2});
        });
  }
};
