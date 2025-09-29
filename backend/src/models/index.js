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

// Authenticate connection
sequelize.authenticate()
  .then(() => {
    console.log("✅ Database connected");
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err);
  });

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

// Tables are created by initTables.js, no need to sync here

module.exports = db;
