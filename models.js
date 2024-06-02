const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  property: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dataCad: {
    type: DataTypes.STRING,
    allowNull: false
  },
  turno: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isDuplicate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: false
});

// Sincroniza o modelo com o banco de dados
(async () => {
  await sequelize.sync({ alter: true }); // Sincroniza as mudanças no esquema
})();

module.exports = User;
