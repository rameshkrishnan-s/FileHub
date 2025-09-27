// models/UserFile.js
module.exports = (sequelize, DataTypes) => {
  const UserFile = sequelize.define("UserFile", {
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    user_name: { type: DataTypes.STRING, allowNull: false },
    file_or_folder: { type: DataTypes.STRING, allowNull: false },
    permission: {
      type: DataTypes.ENUM("read", "write", "admin"),
      allowNull: false,
      defaultValue: "read"
    },
  });

  return UserFile;
};
