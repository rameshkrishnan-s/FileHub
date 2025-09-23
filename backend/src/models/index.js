const { Sequelize } = require('sequelize');
const config = require('../config/config.js').development;

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./user')(sequelize, Sequelize);
db.File = require('./file')(sequelize, Sequelize);
db.Metadata = require('./metadata')(sequelize, Sequelize);

// Set up associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Sync database
db.sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Tables synced with DB');
  })
  .catch((err) => {
    console.error('❌ Error syncing tables:', err);
  });

module.exports = db;
