const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Product = sequelize.define('Product', {
  productId: {
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
    allowNull: false,
  },
  woocommerceId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: DataTypes.STRING,
  description: DataTypes.TEXT,
  price: DataTypes.FLOAT,
  imageUrl: DataTypes.STRING,
  status: {
    type: DataTypes.ENUM('Created Locally', 'Synced', 'Sync Failed'),
    defaultValue: 'Created Locally',
  },
});

module.exports = Product;
