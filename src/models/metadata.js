// models/metadata.js
module.exports = (sequelize, DataTypes) => {
  const Metadata = sequelize.define('Metadata', {
    fileName: { type: DataTypes.STRING, allowNull: false },
    filePath: { type: DataTypes.STRING, allowNull: false },
    type: {
      type: DataTypes.ENUM('file', 'folder'),
      defaultValue: 'file'
    },
    fileId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Files',
        key: 'id'
      }
    }
  });

  Metadata.associate = (models) => {
    Metadata.belongsTo(models.File, {
      foreignKey: 'fileId',
      as: 'File'
    });
  };

  return Metadata;
};
