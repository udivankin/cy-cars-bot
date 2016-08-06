const _ = require('lodash');
const request = require('request');
const cheerio = require('cheerio');
const config = require('./config.js');
const logger = require('./logger.js');

const host = _.last(config.hosts);

request(host.url, (err, resp, body) => {
  if (err) {
    logger.error('Error in url request');
    return;
  }

  const result = host.parser(cheerio.load(body));

  logger.info(result);
});
