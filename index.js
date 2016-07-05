const TelegramBot = require('node-telegram-bot-api');
const token = '249976478:AAGOWvMGc26GGG6SnOrSku7lGPm3jGJTrbQ';
// Setup polling way
const bot = new TelegramBot(token, { polling: true });
const storage = require('./storage.js');

let currentModes = {}; // userId -> mode

const defaultAnswer = 'Hi there, please use "/" to interact';

const modeAnswers = {
  add: 'We are going to add a car to your watch list! Please enter search string (one or more words)',
  addSuccess: 'Ok, '
  cancel: 'Ok then! Anythyng else?',
  clear: 'Your list has been cleared.',
  delete: 'Please select which searches should we delete:',
};

const processAnswer = (userId, text) => {
  switch (currentModes[userId]) {
    case 'add':
      storage.addSubscription(userId, text);
      bot.sendMessage(from.id, 'Ok, "' + text + '" was added to your watch list. We`ll keep you updated!');
      break;

    case 'delete':
      storage.removeSubscription(userId, text);
      bot.sendMessage(from.id, 'Ok, "' + text + '" was removed from your watch list.');
      break;

    case 'clear':
      storage.addSubscription(userId, text);
      bot.sendMessage(from.id, modeAnswers['clear']);

      break;

    case 'list':
      storage.addSubscription(userId, text);
      bot.sendMessage(from.id, 'Here is the list');

      break;

    default:

  }


};

// Matches /echo [whatever]
bot.onText(/\/add/, (msg, match) => {
  const fromId = msg.from.id;

  bot.sendMessage(fromId, modeAnswers.add);

});

// Any kind of message
bot.on('message', msg => {
  const { from, chat, message_id, text } = msg;
  const command = text.match(/\/(.+)/);

  // command message
  if (command) {
    const mode = command.pop();

    currentModes[from.id] = mode === 'cancel' ? '' : mode;
    console.log('CurrentMode of user', from.username, '[', from.id, '] was set to', currentModes[from.id]);

    return;
  }

  // after-command message
  if (currentModes[from.id]) {
    processAnswer(from.id, text);
  } else {
    storage.createUser({
      id: from.id,
      username: from.username,
      firstName: from.first_name,
      lastName: from.last_name,
    });

    bot.sendMessage(from.id, defaultAnswer);
  }
});
