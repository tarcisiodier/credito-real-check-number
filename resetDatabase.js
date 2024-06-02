const { sequelize } = require('./models');

(async () => {
  try {
    // Dropar todas as tabelas
    await sequelize.drop();
    console.log("Todas as tabelas foram removidas.");

    // Sincronizar todas as tabelas (isso recria as tabelas)
    await sequelize.sync({ force: true });
    console.log("Todas as tabelas foram recriadas.");
    
    process.exit(0);
  } catch (error) {
    console.error("Erro ao limpar e sincronizar o banco de dados:", error);
    process.exit(1);
  }
})();
