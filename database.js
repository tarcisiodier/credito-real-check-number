const { Sequelize } = require('sequelize');

// Conecta ao banco de dados SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite'
});

module.exports = sequelize;
