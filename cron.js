const _ = require('lodash');
const schedule = require('node-schedule');
const parser = require('./parser.js');
const config = require('./config.js');
const storage = require('./storage.js');
const bot = require('./bot.js');
const Promise = require('bluebird');

class Cron {
  start() {
    this.gatherTimer = schedule.scheduleJob('*/51 * * * *', this.gather);
    this.sendTimer = schedule.scheduleJob('*/10 * * * *', this.send);
    console.log('Cron initialized');
    this.gather();
    this.send();
  }

  gather() {
    parser.gather();
  }

  send() {
    Promise.join(
      storage.getAllSubscriptions(),
      storage.getLatestCars(),
      (subscriptions, cars) => {
        if (_.isEmpty(subscriptions) || _.isEmpty(cars)) {
          return;
        }

        subscriptions.forEach(subscription => {
          const regexp = RegExp('(' + _.toLower(subscription.searchString).replace(' ', '|') + ')', 'gi');
          const wordCount = subscription.searchString.split(' ').length;
          const matchedCars = _.filter(cars, car => {
            const matches = _.toLower(car.title).match(regexp);
            return matches && matches.length >= wordCount;
          });

          matchedCars.forEach(matchedCar => {
            storage
              .isUserNotified(subscription.userId, matchedCar.id)
              .then(isNotified => {
                if (!isNotified) {
                  storage.addUserNotification(subscription.userId, matchedCar.id);
                  bot.sendNotification(subscription.userId, matchedCar);
                }

                return null;
              });
          });
        })
      }
    )
  }
}

module.exports = new Cron();
