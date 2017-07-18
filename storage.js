const Sequelize = require('sequelize');
const config = require('./config.js');
const _ = require('lodash');
const logger = require('./logger.js');

const sequelize = new Sequelize(config.dbName, config.dbUser, config.dbPass, {
  host: 'localhost',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
});

const User = sequelize.define(
  'user',
  {
    id: { type: Sequelize.INTEGER, primaryKey: true },
    username:  { type: Sequelize.STRING, unique: true },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
  }
);

const Car = sequelize.define(
  'car',
  {
    id: { type: Sequelize.INTEGER, primaryKey: true },
    vendorId: Sequelize.STRING,
    vendorName: Sequelize.STRING,
    title: Sequelize.STRING,
    link: Sequelize.STRING,
    location: Sequelize.STRING,
    year: Sequelize.STRING,
    price: Sequelize.STRING,
  },
  {
    indexes: [{ fields: ['vendorId', 'vendorName', 'title'] }],
  }
);

const Subscription = sequelize.define(
  'subscription',
  {
    id: { type: Sequelize.INTEGER, primaryKey: true },
    userId: Sequelize.INTEGER,
    searchString: Sequelize.STRING,
  },
  {
    indexes: [{ fields: ['userId', 'searchString'] }],
  }
);

const Notification = sequelize.define(
  'notification',
  {
    id: { type: Sequelize.INTEGER, primaryKey: true },
    userId: Sequelize.INTEGER,
    carId: Sequelize.INTEGER,
  },
  {
    indexes: [{ fields: ['userId', 'carId'] }],
  }
);

class Storage {
  constructor() {
    sequelize
      .authenticate()
      .then(() => {
        logger.info('Database connection has been established successfully.');
      })
      .catch(err => {
        logger.error('Unable to connect to the database:', err);
      });
  }

  getUser(id) {
    return User
      .findById(id);
  }

  hasUser(id) {
    return User
      .count({ where: { id } })
      .then(count => count > 0);
  }

  createUser({ id, username, firstName, lastName }) {
    return this
      .hasUser(id)
      .then(hasUser => {
          if (!hasUser) {
            return sequelize
              .sync()
              .then(() => User.create({ id, username, firstName, lastName }))
              .then(user => {
                logger.info('User created', user.get({ plain: true }));
              });
          }
        }
      );
  }

  getAllSubscriptions() {
    return Subscription.findAll();
  }

  getSubscriptions(userId) {
    return Subscription
      .findAll({ where: { userId } });
  }

  addSubscription(userId, searchString) {
    return sequelize
      .sync()
      .then(() => Subscription.create({ userId, searchString }))
      .then(subscription => {
        logger.info('Subscription created', subscription.get({ plain: true }));
      });
  }

  removeSubscription(userId, searchString) {
    return sequelize
      .sync()
      .then(() => Subscription.destroy({ where: { userId, searchString } }))
      .then(subscription => {
        logger.info('Subscription deleted', subscription);
      });
  }

  removeAllSubscriptions(userId) {
    return sequelize
      .sync()
      .then(() => Subscription.destroy({ where: { userId } }))
      .then(subscriptions => {
        logger.info('Subscription deleted', subscriptions);
      });
  }

  addCars(cars) {
    return sequelize
      .sync()
      .then(() => {
        if (!_.isEmpty(cars)) {
          cars.forEach(car => {
            Car.findOrCreate({
              where: _.pick(car, ['vendorId', 'vendorName']),
              defaults: car,
            });
          });
        }

      });
  }

  isUserNotified(userId, carId) {
    return Notification
      .count({ where: { userId, carId } })
      .then(count => count > 0);
  }

  addUserNotification(userId, carId) {
    return sequelize
      .sync()
      .then(() => Notification.create({ userId, carId }));
  }

  getLatestCars() {
    return Car
      .findAll({ limit: 1000, order: [['id', 'DESC']] });
  }
}

module.exports = new Storage();
