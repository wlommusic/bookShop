const Sequelize = require('sequelize');

const sequelize = new Sequelize('book-backend', 'root', 'abcd',
 { dialect: 'mysql', host: 'localhost' })

module.exports = sequelize;