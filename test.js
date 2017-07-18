const { get } = require('pico-ajax');
const cheerio = require('cheerio');
const config = require('./config.js');
const logger = require('./logger.js');

const testParser = host => get(host.url)
    .then((response) => {
      const result = host.parser(cheerio.load(response));
      logger.info(result);
    })
    .catch((error) => {
      logger.error('Error in url request', error);
    });

config.hosts.forEach(testParser);
