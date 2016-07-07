const Promise = require('bluebird');

Promise.config({
  cancellation: true
});

const TelegramBot = require('node-telegram-bot-api');
const storage = require('./storage.js');
const _ = require('lodash');
const config = require('./config.js');
const cron = require('./cron.js');

// Setup polling way
const bot = new TelegramBot(config.token, { polling: true });

let currentModes = {}; // userId -> mode

const defaultAnswer = 'Hi there, please use "/" to interact';

const modeAnswers = {
  add: 'We are going to add a car to your watch list! Please enter search string (one or more words)',
  cancel: 'Ok then! Anythyng else?',
  clear: 'Your watch list has been cleared.',
  emptyList: 'Sorry, you have no cars in your watch list.',
};

const processNewUser = user => {
  storage.createUser({
    id: user.id,
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
  });

  bot.sendMessage(user.id, defaultAnswer);
}

const processCommand = (user, command) => {
  currentModes[user.id] = command === 'cancel' ? '' : command;

  switch (command) {
    case 'add':
      bot.sendMessage(user.id, modeAnswers[command]);

      break;

    case 'cancel':
      bot.sendMessage(user.id, modeAnswers[command]);

      break;

    case 'clear':
      storage.removeAllSubscriptions(user.id);
      bot.sendMessage(user.id, modeAnswers[command]);

      break;

    case 'list':
      storage
        .getSubscriptions(user.id)
        .then(subscriptions => {
          if (_.isEmpty(subscriptions)) {
            bot.sendMessage(user.id, modeAnswers['emptyList']);
          } else {
            let list = '';

            subscriptions.forEach(item => {
              list += item.searchString + '\n';
            });

            bot.sendMessage(user.id, 'Here is your watch list:' + '\n\n' + list);
          }
        });

      currentModes[user.id] = '';

      break;

    case 'delete':
      storage
        .getSubscriptions(user.id)
        .then(subscriptions => {
          if (_.isEmpty(subscriptions)) {
            bot.sendMessage(user.id, modeAnswers['emptyList']);
            currentModes[user.id] = '';
          } else {
            const list = [];

            subscriptions.forEach(item => {
              list.push({ text: item.searchString });
            });

            const markup = {
              keyboard: [list],
              resize_keyboard: true,
              one_time_keyboard: true,
            };

            bot.sendMessage(user.id, 'Please select what should we delete:', { reply_markup: markup });
          }
        });

      break;

    default:
      break;
  }

  console.log('CurrentMode of user', user.username, '[', user.id, '] was set to', currentModes[user.id]);
}

const processAnswer = (user, text) => {
  switch (currentModes[user.id]) {
    case 'add':
      storage.addSubscription(user.id, text);
      bot.sendMessage(user.id, 'Ok, "' + text + '" was added to your watch list. We`ll keep you updated!');

      break;

    case 'delete':
      storage.removeSubscription(user.id, text);
      bot.sendMessage(user.id, 'Ok, "' + text + '" was removed from your watch list.', { reply_markup: { hide_keyboard: true } });

      break;

    default:
      break;
  }
};

// Any kind of message
bot.on('message', msg => {
  const { from, text } = msg;
  const command = text.match(/\/(.+)/);

  // command message
  if (command) {
    processCommand(from, command.pop());
  // after-command message
  } else if (currentModes[from.id]) {
    processAnswer(from, text);
  // new user
  } else {
    processNewUser(from);
  }
});
