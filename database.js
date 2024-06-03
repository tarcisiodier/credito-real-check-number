const { Sequelize } = require('sequelize');

// String de conexão fornecida
const connectionString = 'postgres://postgres:1q2w3e4r5t@sy1bqy.easypanel.host:5432/acelera-zap';

// Configurar a conexão com o banco de dados PostgreSQL usando a string de conexão
const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres', // Define o dialeto como 'postgres'
  dialectOptions: {
    ssl: false, // Se a conexão SSL for necessária, ajuste para true e forneça todas as opções necessárias
  },
  logging: false, // Desabilita o log SQL usado pelo Sequelize para depuração
});

// Testar a conexão
sequelize
  .authenticate()
  .then(() => {
    console.log('Conexão com o banco de dados PostgreSQL estabelecida com sucesso.');
  })
  .catch((error) => {
    console.error('Não foi possível conectar ao banco de dados PostgreSQL:', error);
  });

module.exports = sequelize;