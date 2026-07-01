const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

require('dotenv').config();

const port = process.env.PORT || 3000;
const usersFile = path.join(__dirname, 'users.json');
const ordersFile = path.join(__dirname, 'orders.json');
const publicDir = __dirname;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4'
};

function readUsers() {
  if (!fs.existsSync(usersFile)) return [];
  return JSON.parse(fs.readFileSync(usersFile, 'utf8'));
}

function writeUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

function readOrders() {
  if (!fs.existsSync(ordersFile)) return [];
  return JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
}

function writeOrders(orders) {
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function sendFile(res, statusCode, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendJson(res, 404, { ok: false, message: 'Arquivo não encontrado.' });
      return;
    }

    res.writeHead(statusCode, { 'Content-Type': contentType });
    res.end(content);
  });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

function createToken() {
  return crypto.randomBytes(16).toString('hex');
}

function isSafePath(filePath) {
  const resolvedBase = path.resolve(publicDir);
  const resolvedPath = path.resolve(filePath);
  return resolvedPath.startsWith(resolvedBase);
}

function verifyToken(token) {
  const users = readUsers();
  return users.find(u => u.token === token);
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // ===== HEALTH CHECK =====
  if (requestUrl.pathname === '/health') {
    sendJson(res, 200, { ok: true, status: 'online' });
    return;
  }

  // ===== CADASTRO =====
  if (req.method === 'POST' && requestUrl.pathname === '/api/register') {
    try {
      const { nome, email, senha } = await parseBody(req);
      if (!nome || !email || !senha) {
        sendJson(res, 400, { ok: false, message: 'Preencha todos os campos.' });
        return;
      }

      const users = readUsers();
      if (users.some(user => user.email === email)) {
        sendJson(res, 409, { ok: false, message: 'Este email já está cadastrado.' });
        return;
      }

      const hashedPassword = await bcrypt.hash(senha, 10);
      const newUser = { id: Date.now(), nome, email, senha: hashedPassword, token: createToken() };
      users.push(newUser);
      writeUsers(users);
      sendJson(res, 201, { ok: true, user: { id: newUser.id, nome, email }, token: newUser.token });
    } catch (error) {
      sendJson(res, 400, { ok: false, message: 'Erro ao processar requisição.' });
    }
    return;
  }

  // ===== LOGIN =====
  if (req.method === 'POST' && requestUrl.pathname === '/api/login') {
    try {
      const { email, senha } = await parseBody(req);
      const users = readUsers();
      const user = users.find(u => u.email === email);

      if (!user || !(await bcrypt.compare(senha, user.senha))) {
        sendJson(res, 401, { ok: false, message: 'Email ou senha inválidos.' });
        return;
      }

      user.token = createToken();
      writeUsers(users);
      sendJson(res, 200, { ok: true, user: { id: user.id, nome: user.nome, email: user.email }, token: user.token });
    } catch (error) {
      sendJson(res, 400, { ok: false, message: 'Erro ao processar requisição.' });
    }
    return;
  }

  // ===== LOGOUT =====
  if (req.method === 'POST' && requestUrl.pathname === '/api/logout') {
    try {
      const { token } = await parseBody(req);
      if (!token) {
        sendJson(res, 400, { ok: false, message: 'Token ausente.' });
        return;
      }

      const users = readUsers();
      const user = users.find(u => u.token === token);
      if (!user) {
        sendJson(res, 401, { ok: false, message: 'Sessão inválida.' });
        return;
      }

      user.token = null;
      writeUsers(users);
      sendJson(res, 200, { ok: true, message: 'Logout realizado com sucesso.' });
    } catch (error) {
      sendJson(res, 400, { ok: false, message: 'Erro ao processar requisição.' });
    }
    return;
  }

  // ===== GOOGLE AUTH =====
  if (req.method === 'POST' && requestUrl.pathname === '/api/google-auth') {
    try {
      const { credential, nome, email } = await parseBody(req);
      const mockGoogle = process.env.GOOGLE_AUTH_MOCK ? JSON.parse(process.env.GOOGLE_AUTH_MOCK) : null;
      const googleEmail = email || mockGoogle?.email;
      const googleName = nome || mockGoogle?.name || googleEmail?.split('@')[0] || 'Usuário Google';

      if (!credential && !googleEmail) {
        sendJson(res, 400, { ok: false, message: 'Dados do Google ausentes.' });
        return;
      }

      const users = readUsers();
      const user = users.find(u => u.email === googleEmail);
      const authUser = user || {
        id: Date.now(),
        nome: googleName,
        email: googleEmail,
        senha: '',
        token: createToken(),
        provider: 'google'
      };

      if (!user) {
        users.push(authUser);
        writeUsers(users);
      } else {
        authUser.token = createToken();
        writeUsers(users);
      }

      sendJson(res, 200, { ok: true, user: { id: authUser.id, nome: authUser.nome, email: authUser.email }, token: authUser.token });
    } catch (error) {
      sendJson(res, 400, { ok: false, message: 'Erro ao processar requisição.' });
    }
    return;
  }

  if (req.method === 'GET' && requestUrl.pathname === '/api/google-config') {
    sendJson(res, 200, { clientId: process.env.GOOGLE_CLIENT_ID || 'SEU_CLIENT_ID_GOOGLE' });
    return;
  }

  // ===== PEDIDOS =====
  
  // GET /api/pedidos - Listar pedidos do usuário
  if (req.method === 'GET' && requestUrl.pathname === '/api/pedidos') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        sendJson(res, 401, { ok: false, message: 'Token ausente.' });
        return;
      }

      const user = verifyToken(token);
      if (!user) {
        sendJson(res, 401, { ok: false, message: 'Sessão inválida.' });
        return;
      }

      const orders = readOrders();
      const userOrders = orders.filter(order => order.userId === user.id);
      sendJson(res, 200, { ok: true, orders: userOrders });
    } catch (error) {
      sendJson(res, 400, { ok: false, message: 'Erro ao processar requisição.' });
    }
    return;
  }

  // POST /api/pedidos - Criar novo pedido
  if (req.method === 'POST' && requestUrl.pathname === '/api/pedidos') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        sendJson(res, 401, { ok: false, message: 'Token ausente.' });
        return;
      }

      const user = verifyToken(token);
      if (!user) {
        sendJson(res, 401, { ok: false, message: 'Sessão inválida.' });
        return;
      }

      const { items, total } = await parseBody(req);
      if (!items || !total) {
        sendJson(res, 400, { ok: false, message: 'Items e total são obrigatórios.' });
        return;
      }

      const newOrder = {
        id: Date.now(),
        userId: user.id,
        items,
        total,
        status: 'pendente',
        createdAt: new Date().toISOString()
      };

      const orders = readOrders();
      orders.push(newOrder);
      writeOrders(orders);

      sendJson(res, 201, { ok: true, order: newOrder });
    } catch (error) {
      sendJson(res, 400, { ok: false, message: 'Erro ao processar requisição.' });
    }
    return;
  }

  // GET /api/pedidos/:id - Obter detalhes do pedido
  if (req.method === 'GET' && requestUrl.pathname.startsWith('/api/pedidos/')) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        sendJson(res, 401, { ok: false, message: 'Token ausente.' });
        return;
      }

      const user = verifyToken(token);
      if (!user) {
        sendJson(res, 401, { ok: false, message: 'Sessão inválida.' });
        return;
      }

      const orderId = parseInt(requestUrl.pathname.split('/').pop());
      const orders = readOrders();
      const order = orders.find(o => o.id === orderId && o.userId === user.id);

      if (!order) {
        sendJson(res, 404, { ok: false, message: 'Pedido não encontrado.' });
        return;
      }

      sendJson(res, 200, { ok: true, order });
    } catch (error) {
      sendJson(res, 400, { ok: false, message: 'Erro ao processar requisição.' });
    }
    return;
  }

  // DELETE /api/pedidos/:id - Cancelar pedido
  if (req.method === 'DELETE' && requestUrl.pathname.startsWith('/api/pedidos/')) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        sendJson(res, 401, { ok: false, message: 'Token ausente.' });
        return;
      }

      const user = verifyToken(token);
      if (!user) {
        sendJson(res, 401, { ok: false, message: 'Sessão inválida.' });
        return;
      }

      const orderId = parseInt(requestUrl.pathname.split('/').pop());
      const orders = readOrders();
      const orderIndex = orders.findIndex(o => o.id === orderId && o.userId === user.id);

      if (orderIndex === -1) {
        sendJson(res, 404, { ok: false, message: 'Pedido não encontrado.' });
        return;
      }

      orders[orderIndex].status = 'cancelado';
      writeOrders(orders);
      sendJson(res, 200, { ok: true, message: 'Pedido cancelado com sucesso.' });
    } catch (error) {
      sendJson(res, 400, { ok: false, message: 'Erro ao processar requisição.' });
    }
    return;
  }

  // ===== PAGAMENTO STRIPE =====
  if (req.method === 'POST' && requestUrl.pathname === '/api/create-payment-intent') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        sendJson(res, 401, { ok: false, message: 'Token ausente.' });
        return;
      }

      const user = verifyToken(token);
      if (!user) {
        sendJson(res, 401, { ok: false, message: 'Sessão inválida.' });
        return;
      }

      const { amount } = await parseBody(req);
      if (!amount || amount <= 0) {
        sendJson(res, 400, { ok: false, message: 'Valor inválido.' });
        return;
      }

      if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
        sendJson(res, 200, { ok: true, clientSecret: 'mock_secret_' + Date.now(), message: 'Modo teste (sem Stripe)' });
        return;
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'brl',
        metadata: { userId: user.id }
      });

      sendJson(res, 200, { ok: true, clientSecret: paymentIntent.client_secret });
    } catch (error) {
      sendJson(res, 400, { ok: false, message: 'Erro ao processar pagamento.' });
    }
    return;
  }

  // ===== SERVIR ARQUIVOS ESTÁTICOS =====
  const pathname = decodeURIComponent(requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname);
  const filePath = path.join(publicDir, pathname);

  if (!isSafePath(filePath)) {
    sendJson(res, 403, { ok: false, message: 'Acesso negado.' });
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    sendFile(res, 200, filePath);
    return;
  }

  sendJson(res, 404, { ok: false, message: 'Rota não encontrada.' });
});

server.listen(port, () => {
  console.log(`✅ Servidor rodando em http://localhost:${port}`);
});
      }

      sendJson(res, 200, { ok: true, user: { id: authUser.id, nome: authUser.nome, email: authUser.email }, token: authUser.token });
    } catch (error) {
      sendJson(res, 400, { ok: false, message: 'JSON inválido.' });
    }
    return;
  }

  if (req.method === 'GET' && requestUrl.pathname === '/api/google-config') {
    sendJson(res, 200, { clientId: process.env.GOOGLE_CLIENT_ID || 'SEU_CLIENT_ID_GOOGLE' });
    return;
  }

  const pathname = decodeURIComponent(requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname);
  const filePath = path.join(publicDir, pathname);

  if (!isSafePath(filePath)) {
    sendJson(res, 403, { ok: false, message: 'Acesso negado.' });
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    sendFile(res, 200, filePath);
    return;
  }

  sendJson(res, 404, { ok: false, message: 'Rota não encontrada.' });
});

server.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
