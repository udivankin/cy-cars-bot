var TelegramBot = require('node-telegram-bot-api');

var token = '249976478:AAGOWvMGc26GGG6SnOrSku7lGPm3jGJTrbQ';
// Setup polling way
var bot = new TelegramBot(token, { polling: true });

// Matches /echo [whatever]
bot.onText(/\/echo (.+)/, function (msg, match) {
  var fromId = msg.from.id;
  var resp = match[1];
  bot.sendMessage(fromId, resp);
});

// Any kind of message
bot.on('message', function (msg) {
  var chatId = msg.chat.id;
  // photo can be: a file path, a stream or a Telegram file_id
  var photo = 'cats.png';
  bot.sendMessage(chatId, JSON.stringify(msg));
});
