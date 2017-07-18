const { get } = require('pico-ajax');
const cheerio = require('cheerio');
const config = require('./config.js');
const storage = require('./storage.js');
const logger = require('./logger.js');

class Parser {
  gather(host) {
    get(host.url)
      .then((response) => {
        const result = host.parser(cheerio.load(response));
        storage.addCars(result);
      })
      .catch((error) => {
        logger.error('Error in url request', error);
      });
  }

  gatherAll() {
    config.hosts.forEach(host => {
      this.gather(host);
    });
  }
}

module.exports = new Parser();
