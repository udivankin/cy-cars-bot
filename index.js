const TelegramBot = require('node-telegram-bot-api');
const token = '249976478:AAGOWvMGc26GGG6SnOrSku7lGPm3jGJTrbQ';
// Setup polling way
const bot = new TelegramBot(token, { polling: true });
const storage = require('./storage.js');

let currentModes = {}; // userId -> mode

const defaultAnswer = 'Hi there, please use "/" to interact';

const modeAnswers = {
  add: 'We are going to add a car to your watch list! Please enter search string (one or more words)',
  cancel: 'Ok then! Anythyng else?',
  delete: 'Please select which searches should we delete:',
};

// Matches /echo [whatever]
bot.onText(/\/add/, (msg, match) => {
  const fromId = msg.from.id;

  bot.sendMessage(fromId, modeAnswers.add);
  //storage.addSubscription(fromId, match);
});

// Any kind of message
bot.on('message', msg => {
  const { from, chat, message_id, text } = msg;
  const command = text.match(/\/(.+)/);

  if (command) {
    currentModes[from.id] = command.pop();
    console.log('CurrentMode of user', from.username, '[', from.id, '] was set to', currentModes[from.id]);
  }

  storage.createUser({
    id: from.id,
    username: from.username,
    firstName: from.first_name,
    lastName: from.last_name,
  });

  bot.sendMessage(chat.id, JSON.stringify(msg));
});
