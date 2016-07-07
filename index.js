const Promise = require('bluebird');

Promise.config({
  cancellation: true
});

const bot = require('./bot.js');
const cron = require('./cron.js');

bot.init();
cron.start();
