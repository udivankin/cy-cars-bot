const request = require('request');
const cheerio = require('cheerio');
const config = require('./config.js');
const storage = require('./storage.js');
const logger = require('./logger.js');

class Parser {
  gather(host) {
    request(host.url, (err, resp, body) => {
      if (err) {
        logger.error('Error in url request');
        return;
      }

      const result = host.parser(cheerio.load(body));
      storage.addCars(result);
    });
  }

  gatherAll() {
    config.hosts.forEach(host => {
      this.gather(host);
    });
  }
}

module.exports = new Parser();
