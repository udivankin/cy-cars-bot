const log4js = require('log4js');

log4js.configure({
  appenders: {
    stdout: { type: 'stdout' },
    logfile: { type: 'file', filename: 'logs.txt'},
  },
  categories: {
    default: { appenders: ['stdout', 'logfile'], level: 'debug' },
  }
});

module.exports = log4js.getLogger();
