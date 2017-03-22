const _ = require('lodash');
const schedule = require('node-schedule');
const parser = require('./parser.js');
const config = require('./config.js');
const storage = require('./storage.js');
const bot = require('./bot.js');
const Promise = require('bluebird');
const logger = require('./logger.js');

class Cron {
  start() {
    logger.info('Cron initialized');
    this.getherJobs = [];
    this.sendJob = null;
    this.initSendJobs();
    this.initGatherJobs();
  }

  initSendJobs() {
    this.sendJob = schedule.scheduleJob('*/10 * * * *', this.send);
    this.send();
  }

  initGatherJobs() {
    config.hosts.forEach(host => {
      const randomMinute = _.random(1, 59);
      const cronString = randomMinute + ' */' + host.interval + ' * * *';
      this.getherJobs.push(schedule.scheduleJob(cronString, _.partial(parser.gather, host)));
    });
    parser.gatherAll();
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
            const matches = _.uniq(_.toLower(car.title + ' ' + car.year).match(regexp));
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
