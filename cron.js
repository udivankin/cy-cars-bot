const schedule = require('node-schedule');
const parser = require('./parser.js');

class Cron {
  constructor() {
    this.timer = schedule.scheduleJob('*/10 * * * * *', this.timerAction);
        parser.parse();
  }

  timerAction() {
    // parser.parse();
  }
}

module.exports = new Cron();
