module.exports = (sequelize, DataTypes) => {
  const UserChat = sequelize.define("UserChat", {
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    user_name: { type: DataTypes.STRING, allowNull: false },
    task: { type: DataTypes.STRING },
    file_or_folder: { type: DataTypes.STRING },
    message: { type: DataTypes.TEXT, allowNull: false },
    sender: { type: DataTypes.ENUM("user", "admin"), allowNull: false },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  return UserChat;
};
