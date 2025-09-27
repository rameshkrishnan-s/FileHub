const { Sequelize, DataTypes } = require("sequelize");
const config = require("../config/config.js").development;

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models consistently
db.Role = require("./role")(sequelize, DataTypes);
db.User = require("./user")(sequelize, DataTypes);
db.UserFile = require("./userFile")(sequelize, DataTypes);
db.UserChat = require("./userChat")(sequelize, DataTypes);
db.File = require("./file")(sequelize, DataTypes);
db.Metadata = require("./metadata")(sequelize, DataTypes);
db.task = require("./task")(sequelize, DataTypes);

// Associations (if defined in each model)
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Sync database
db.sequelize
  .sync({ alter: true }) // auto create/alter tables
  .then(() => {
    console.log("✅ Tables synced with DB");
  })
  .catch((err) => {
    console.error("❌ Error syncing tables:", err);
  });

module.exports = db;
