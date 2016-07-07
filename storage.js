const Sequelize = require('sequelize');
const config = require('./config.js');
const _ = require('lodash');

sequelize = new Sequelize(config.dbName, config.dbUser, config.dbPass, {
  host: 'localhost',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
});

User = sequelize.define(
  'user',
  {
    id: { type: Sequelize.INTEGER, primaryKey: true },
    username:  { type: Sequelize.STRING, unique: true },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
  }
);

Car = sequelize.define(
  'car',
  {
    vendorId: Sequelize.STRING,
    vendorName: Sequelize.STRING,
    title: Sequelize.STRING,
    link: Sequelize.STRING,
    location: Sequelize.STRING,
    year: Sequelize.STRING,
    price: Sequelize.STRING,
  },
  {
    indexes: [{ fields: ['vendorId', 'vendorName', 'title'] }]
  }
);

Subscription = sequelize.define(
  'subscription',
  {
    userId: Sequelize.INTEGER,
    searchString: Sequelize.STRING,
  },
  {
    indexes: [{ fields: ['userId', 'searchString'] }]
  }
);

class Storage {
  constructor() {
    sequelize
      .authenticate()
      .then(err => {
        console.log('Database connection has been established successfully.');
      })
      .catch(err => {
        console.log('Unable to connect to the database:', err);
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
                console.log('User created', user.get({ plain: true }));
              })
          }
        }
      );
  }

  getSubscriptions(userId) {
    return Subscription
      .findAll({ where: { userId } });
  };

  addSubscription(userId, searchString) {
    return sequelize
      .sync()
      .then(() => Subscription.create({ userId, searchString }))
      .then(subscription => {
        console.log('Subscription created', subscription.get({ plain: true }));
      });
  };

  removeSubscription(userId, searchString) {
    return sequelize
      .sync()
      .then(() => Subscription.destroy({ where: { userId, searchString } }))
      .then(subscription => {
        console.log('Subscription deleted', subscription);
      });
  };

  removeAllSubscriptions(userId) {
    return sequelize
      .sync()
      .then(() => Subscription.destroy({ where: { userId } }))
      .then(subscriptions => {
        console.log('Subscription deleted', subscriptions);
      });
  };

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
          })
        }

      });
  };
}

module.exports = new Storage();
