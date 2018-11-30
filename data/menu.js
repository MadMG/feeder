const menu = require('netzwerk111-menu');
const Pact = require('bluebird');
const moment = require('moment');
const store = require('./file-store');

module.exports = {
  _pendingRequest: undefined,

  _retrieveData () {
    return new Pact(function (resolve, reject) {
      menu.retrieve(function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  },

  _merge (existing, newItems) {
    const days = [];
    const merged = newItems.map(function (item) {
      days.push(item.date);
      return item;
    });

    merged.concat(existing.filter(function (menu) {
      return days.indexOf(menu.date) === -1;
    }));

    return merged;
  },

  getCurrentWeek () {
    const currentDay = moment();

    return this._getWeek(currentDay)
        .then((data) => {
          let week;

          if (Array.isArray(data)) {
            week = data.filter((day) => parseInt(day.week, 10) === currentDay.week());
          }

          return week && week.length > 0 ? week : Pact.reject({status: 404, message: 'no data'});
        });
  },

  getWeek (week) {
    const startOfWeek = moment().day('Monday').week(week);

    return this._getWeek(startOfWeek)
        .then((data) => {
          let week;

          if (Array.isArray(data)) {
            week = data.filter((day) => parseInt(day.week, 10) === startOfWeek.week());
          }

          return week && week.length > 0 ? week : Pact.reject({status: 404, message: 'no data'});
        });
  },

  _getWeek (date) {
    const self = this;

    return store.hasData(date)
        .then(() => {
          return store.readData(date);
        }, () => self._getAndStoreCurrentWeek());
  },

  get (date) {
    const self = this;

    return store.hasData(date)
        .then(() => {
          return store.readData(date);
        }, () => self._getAndStoreCurrentWeek())
        .then((data) => {
          const filtered = data.filter(function (menu) {
            return menu.date === date;
          });

          if (filtered.length === 0) {
            return Pact.reject({status: 404, message: 'no data'});
          }

          return filtered[0];
        })
        .catch((err) => {
          return Pact.reject({status: 404, message: 'no data'});
        });
  },

  _getAndStoreCurrentWeek () {
    if (!this._pendingRequest) {
      const self = this;

      this._pendingRequest = this._retrieveData()
          .then(function (data) {
            return store.saveData(data);
          })
          .then(function (data) {
            self._pendingRequest = undefined;
            return data;
          });
    }

    return this._pendingRequest;
  }
};
