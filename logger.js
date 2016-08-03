const log4js = require('log4js');

log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'logs.txt'},
  ]
});

module.exports = log4js.getLogger();
