const test = require('node:test');
const assert = require('node:assert');
const { spawn } = require('node:child_process');
const path = require('node:path');

let serverProcess;
const baseUrl = 'http://127.0.0.1:3000';

function waitForServer(timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const started = Date.now();

    const tryConnect = () => {
      const req = require('node:http').get(baseUrl + '/health', (res) => {
        res.resume();
        resolve();
      });

      req.on('error', () => {
        if (Date.now() - started > timeoutMs) {
          reject(new Error('Servidor não respondeu a tempo'));
          return;
        }
        setTimeout(tryConnect, 150);
      });
    };

    tryConnect();
  });
}

test('deve cadastrar e autenticar um usuário', async () => {
  serverProcess = spawn(process.execPath, ['server.js'], {
    cwd: path.join(__dirname, '..'),
    stdio: ['ignore', 'pipe', 'pipe']
  });

  await waitForServer();

  const email = `teste+${Date.now()}@mail.com`;

  const registerResponse = await fetch(baseUrl + '/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome: 'Usuário Teste', email, senha: '123456' })
  });

  const registerData = await registerResponse.json();
  assert.equal(registerResponse.status, 201);
  assert.equal(registerData.ok, true);

  const loginResponse = await fetch(baseUrl + '/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha: '123456' })
  });

  const loginData = await loginResponse.json();
  assert.equal(loginResponse.status, 200);
  assert.equal(loginData.ok, true);
  assert.ok(loginData.token);

  serverProcess.kill('SIGTERM');
});

test('deve aceitar autenticação via Google', async () => {
  serverProcess = spawn(process.execPath, ['server.js'], {
    cwd: path.join(__dirname, '..'),
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, GOOGLE_AUTH_MOCK: JSON.stringify({ email: 'google@test.com', name: 'Google User' }) }
  });

  await waitForServer();

  const response = await fetch(baseUrl + '/api/google-auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential: 'token-google-teste' })
  });

  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.ok, true);
  assert.equal(data.user.email, 'google@test.com');
  assert.ok(data.token);

  serverProcess.kill('SIGTERM');
});

test('deve expor o client id do Google via configuração', async () => {
  serverProcess = spawn(process.execPath, ['server.js'], {
    cwd: path.join(__dirname, '..'),
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, GOOGLE_CLIENT_ID: 'client-id-teste' }
  });

  await waitForServer();

  const response = await fetch(baseUrl + '/api/google-config');
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.clientId, 'client-id-teste');

  serverProcess.kill('SIGTERM');
});

test('deve servir imagens com nomes que contêm espaços', async () => {
  serverProcess = spawn(process.execPath, ['server.js'], {
    cwd: path.join(__dirname, '..'),
    stdio: ['ignore', 'pipe', 'pipe']
  });

  await waitForServer();

  const response = await fetch(baseUrl + '/imagens/Cyberpunk%202077.jpeg');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') || '', /image/);

  serverProcess.kill('SIGTERM');
});
