const express = require('express');
const cors = require('cors');
const venom = require('venom-bot');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors()); // libera CORS para qualquer origem

let clientInstance = null;

venom.create({
  session: 'botzap',
  headless: true,
  useChrome: true,
  executablePath: '/usr/bin/chromium-browser', // caminho do chromium no Ubuntu
  browserArgs: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-gpu'
  ],
})
.then(client => {
  clientInstance = client;
  console.log('✅ Venom iniciado com sucesso! Escaneie o QR code no terminal.');

  // Enviar mensagem
  app.post('/send-message', async (req, res) => {
    const { to, message } = req.body;
    if (!to || !message) {
      return res.status(400).json({ error: 'Campos "to" e "message" são obrigatórios.' });
    }

    try {
      await client.sendText(to, message);
      res.json({ success: true, message: 'Mensagem enviada!' });
    } catch (error) {
      res.status(500).json({ error: error.toString() });
    }
  });

  // Listar todos os chats
  app.get('/get-chats', async (req, res) => {
    try {
      const chats = await client.getAllChats();
      res.json(chats);
    } catch (error) {
      res.status(500).json({ error: error.toString() });
    }
  });

  // Listar grupos
  app.get('/get-groups', async (req, res) => {
    try {
      const chats = await client.getAllChats();
      const groups = chats.filter(chat => chat.isGroup);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: error.toString() });
    }
  });

  // Listar contatos
  app.get('/get-contacts', async (req, res) => {
    try {
      const contacts = await client.getAllContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: error.toString() });
    }
  });

  // Obter info de chat pelo ID
  app.get('/get-chat/:id', async (req, res) => {
    const chatId = req.params.id;
    try {
      const chat = await client.getChatById(chatId);
      res.json(chat);
    } catch (error) {
      res.status(404).json({ error: 'Chat não encontrado', details: error.toString() });
    }
  });

  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 API rodando em http://0.0.0.0:${port}`);
  });
})
.catch(error => {
  console.error('Erro ao iniciar Venom:', error);
});

