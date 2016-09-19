var menu = require('netzwerk111-menu');
var Pact = require('bluebird');
var moment = require('moment');

module.exports = {
  _cache: [],

  _lastCheck: null,

  _retrieveData: function () {
    return new Pact(function (resolve, reject) {
      menu.retrieve(function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    })
  },

  _merge: function (existing, newItems) {
    var days = [];
    var merged = newItems.map(function (item) {
      days.push(item.date);
      return item;
    });

    merged.concat(existing.filter(function (menu) {
      return days.indexOf(menu.date) === -1;
    }));

    return merged;
  },

  getAll: function () {
    var currentDay = moment();
    var self = this;

    if (this._cache.length === 0 || !this._lastCheck || this._lastCheck.isBefore(currentDay, 'day')) {
      return this._retrieveData()
          .then(function (data) {
            if (Array.isArray(data)) {
              self._cache = self._merge(self._cache, data);
            }
            self._lastCheck = currentDay;
            return data;
          });
    }
    return Pact.resolve(this._cache)
  },

  get: function (date) {
    return this.getAll()
        .then(function (data) {
          var filtered = data.filter(function (menu) {
            return menu.date === date;
          });

          if (filtered.length === 0) {
            return Pact.reject({status: 404, message: 'no data'});
          }

          return filtered[0];
        });
  }
};