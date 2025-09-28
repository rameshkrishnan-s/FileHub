// models/task.js
module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define("Task", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    task: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    file_or_folder_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'completed'),
      defaultValue: 'pending',
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: "tasks",
    timestamps: false, // disable default Sequelize timestamps
  });

  // Associations
  Task.associate = (models) => {
    Task.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user"
    });
  };

  return Task;
};
