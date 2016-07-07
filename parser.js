const request = require('request');
const cheerio = require('cheerio');
const config = require('./config.js');
const storage = require('./storage.js');

class Parser {
  gather() {
    config.hosts.forEach(host => {
      request(host.url, (err, resp, body) => {
        if (err) {
          console.log('Error in url request');
          return;
        }

        const result = host.parser(cheerio.load(body));
        storage.addCars(result);
      });
    });
  }
}

module.exports = new Parser();
