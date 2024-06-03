const express = require('express');
const axios = require('axios');  // Importe axios
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const app = express();
const port = 3000;
const User = require('./models'); // Ajuste o caminho conforme necessário
const sequelize = require('./database');

app.use(cors());
app.use(bodyParser.json());

const apiUrl = 'http://74.48.61.25:1337/send/text';
const headers = {
  'Content-Type': 'application/json',
  'token': '56d6c029-60de-4dc9-bc6e-e18c91f30052',
};

// Função para formatar o número de telefone
const formatPhoneNumber = (phone) => {
  // Remove caracteres que não são dígitos
  phone = phone.replace(/\D/g, '');

  // Remove o código de país, se presente
  if (phone.length === 13 && phone.startsWith('55')) {
    phone = phone.slice(2);
  } else if (phone.length === 12 && phone.startsWith('55')) {
    phone = phone.slice(2);
  }

  // Adiciona o dígito '9' se o número tiver 10 dígitos
  if (phone.length === 10) {
    phone = phone.slice(0, 2) + '9' + phone.slice(2);
  }

  return phone;
};


// Rota para obter o telefone do usuário mais antigo
app.get('/phone', async (req, res) => {
  try {
    const oldestUser = await User.findOne({
      where: { isActive: true },
      order: [['id', 'ASC']],
      attributes: ['phone', 'id']
    });

    if (!oldestUser) {
      return res.status(404).json({ error: 'Nenhum usuário ativo encontrado' });
    }

    res.json({ phoneNumber: oldestUser.phone });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao consultar os usuários' });
  }
});


// Novo endpoint para remover um número específico
// app.get('/remove-phone', (req, res) => {
//   const { phoneNumber } = req.query;

//   if (!phoneNumber) {
//     return res.status(400).json({ error: 'Número de telefone não fornecido' });
//   }

//   const index = phoneNumbers.indexOf(phoneNumber);
//   if (index !== -1) {
//     phoneNumbers.splice(index, 1);
//     console.log(phoneNumber);
//     return res.json({ message: `${phoneNumber} removido da lista`, phoneNumbers });
//   } else {
//     return res.status(404).json({ error: 'Número de telefone não encontrado na lista' });
//   }
// });

app.get('/remove-phone', async (req, res) => {
  const { phoneNumber } = req.query;

  if (!phoneNumber) {
    return res.status(400).json({ error: 'Número de telefone não fornecido' });
  }

  try {
    const user = await User.findOne({ where: { phone: phoneNumber } });

    if (!user) {
      return res.status(404).json({ error: 'Número de telefone não encontrado no banco de dados' });
    }

    // Atualiza isActive para false e isDuplicate para true
    user.isActive = 0;
    user.isDuplicate = 0;
    await user.save();

    // Enviar os dados do usuário para a API externa
    const userData = {    
        "Phone": "555180405853",
        "Body": `*>>> NOVO-LEAD <<<*\n*Nome :* ${user.name}\n*Telefone :* ${user.phone}\n*Turno :* ${user.turno}\n*Email :* ${user.email}\n*Imóvel Cod. :* ${user.property}\n*Data :* ${user.dataCad}\n*Agência :* Moinhos`,
        "Id": uuidv4()
     }

    await axios.post(apiUrl, userData, { headers });

    return res.json({ message: `${phoneNumber} removido da lista e marcado como duplicado`, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao atualizar o usuário' });
  }
});




// Novo endpoint para adicionar um telefone duplicado
app.get('/add-duplicate-phone', async (req, res) => {
  const { phoneNumber } = req.query;

  if (!phoneNumber) {
    return res.status(400).json({ error: 'Número de telefone não fornecido' });
  }

  try {
    const users = await User.findAll({ where: { phone: phoneNumber } });

    if (users.length === 0) {
      return res.status(404).json({ error: 'Número de telefone não encontrado no banco de dados' });
    }

    // Atualiza isActive para false e isDuplicate para true para todos os registros encontrados
    for (let user of users) {
      user.isActive = 0;
      user.isDuplicate = 1;
      await user.save();

      // Enviar os dados do usuário para a API externa
      const userData = {
        "Phone": "555180405853",
        "Body": `*>>> LEAD DUPLICADO! <<<*\n*Nome :* ${user.name}\n*Telefone :* ${user.phone}\n*Turno :* ${user.turno}\n*Email :* ${user.email}\n*Imóvel Cod. :* ${user.property}\n*Data :* ${user.dataCad}\n*Agência :* Moinhos`,
        "Id": uuidv4()
      };

      await axios.post(apiUrl, userData, { headers });
    }

    return res.json({ message: `Todos os registros com o telefone ${phoneNumber} foram atualizados como duplicados e isActive ajustado para false.` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao atualizar os usuários' });
  }
});

// Novo endpoint para salvar dados no banco de dados SQLite
app.post('/save-data', async (req, res) => {
  const { name, phone, email, property, dataCad, turno } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Nome e telefone são obrigatórios!' });
  }

  try {
    const formattedPhone = formatPhoneNumber(phone);
    const newUser = await User.create({ name, phone: formattedPhone, email, property, dataCad, turno });
    res.json({ message: 'Dados salvos com sucesso', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao salvar os dados' });
  }
});

// Novo endpoint para listar todos os usuários
app.get('/users', async (req, res) => {
  try {
    const users = await User.findAll();  // Encontra todos os usuários no banco de dados
    return res.json(users);  // Retorna os usuários em formato JSON
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao listar os usuários' });
  }
});

// Novo endpoint para listar usuários duplicados
app.get('/users/duplicates', async (req, res) => {
  try {
    const duplicateUsers = await User.findAll({ where: { isDuplicate: true } });  // Encontra todos os usuários duplicados no banco de dados
    return res.json(duplicateUsers);  // Retorna os usuários duplicados em formato JSON
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao listar os usuários duplicados' });
  }
});


// Novo endpoint de status
app.get('/status', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'OK', message: 'API is running properly', version: '0.0.2' });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    res.status(500).json({ status: 'ERROR', message: 'API is not running properly', error: error.message });
  }
});

app.listen(3000, async () => {
  console.log('Servidor iniciado na porta 3000');

  try {
    // Sincronize o banco de dados
    await sequelize.sync();

    // Listar todos os usuários no banco de dados
    const users = await User.findAll();
    console.log('Usuários no banco de dados na inicialização do servidor:', users);
  } catch (error) {
    console.error('Erro ao inicializar o servidor e listar usuários:', error);
  }
});
