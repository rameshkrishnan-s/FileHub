module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define("Role", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    timestamps: false
  });

  Role.associate = (models) => {
    Role.hasMany(models.User, { foreignKey: "role_id", onDelete: "CASCADE" });
  };

  return Role;
};
