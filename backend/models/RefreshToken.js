const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const RefreshToken = sequelize.define('RefreshToken', {
  tokenId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'userId',
    },
    onDelete: 'CASCADE',
  },
  token: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = RefreshToken;
