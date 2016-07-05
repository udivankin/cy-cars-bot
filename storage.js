const Sequelize = require('sequelize');
const config = require('./config.js');

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

Subscription = sequelize.define(
  'subscription',
  {
    userId: Sequelize.INTEGER,
    searchString: Sequelize.STRING,
  },
  {
    indexes: [{ fields: ['userId'], }]
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

  createUser({ id, username, firstName, lastName }) {
    return User
      .count({ where: { id } })
      .then(count => {
          if (!count) {
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

  addSubscription(userId, searchString) {
    return sequelize
      .sync()
      .then(() => Subscription.create({ userId, searchString }))
      .then(subscription => {
        console.log('Subscription created', subscription.get({ plain: true }));
      })
  };

  removeSubscription(id) {

  };

  removeAllSubscriptions(userId) {

  };
}

module.exports = new Storage();
