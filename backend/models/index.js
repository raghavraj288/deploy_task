const sequelize = require('../config/db');
const User = require('./User');
const Product = require('./Product');
const RefreshToken = require('./RefreshToken');

// Associations
User.hasMany(Product, { foreignKey: 'userId' });
Product.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(RefreshToken, { foreignKey: 'userId' });
RefreshToken.belongsTo(User, { foreignKey: 'userId' });

module.exports = { sequelize, User, Product, RefreshToken };
