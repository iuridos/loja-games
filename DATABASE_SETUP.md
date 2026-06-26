# Guia de Migração: JSON → PostgreSQL/MongoDB

## 📚 Por que migrar?

- ✅ Segurança aprimorada
- ✅ Consultas mais eficientes
- ✅ Escalabilidade
- ✅ Relacionamentos entre dados
- ✅ Backups automáticos

---

## 🗄️ Opção 1: PostgreSQL (Recomendado)

### Passo 1: Instalar dependências

```bash
npm install pg
```

### Passo 2: Configurar variáveis de ambiente

Adicione ao `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=sua_senha
DB_NAME=iuridos_games
```

### Passo 3: Criar banco de dados

```sql
CREATE DATABASE iuridos_games;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  token VARCHAR(255),
  provider VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  items JSONB NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pendente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);
```

### Passo 4: Modificar server.js

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

function readUsers() {
  return pool.query('SELECT * FROM users');
}

function writeUser(user) {
  return pool.query(
    'INSERT INTO users (nome, email, senha, token, provider) VALUES ($1, $2, $3, $4, $5)',
    [user.nome, user.email, user.senha, user.token, user.provider || null]
  );
}
```

---

## 🍃 Opção 2: MongoDB (NoSQL)

### Passo 1: Instalar dependências

```bash
npm install mongoose
```

### Passo 2: Configurar variáveis de ambiente

```env
MONGODB_URI=mongodb://localhost:27017/iuridos_games
```

### Passo 3: Definir schemas

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nome: String,
  email: { type: String, unique: true },
  senha: String,
  token: String,
  provider: String,
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  items: Array,
  total: Number,
  status: { type: String, default: 'pendente' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);

module.exports = { User, Order };
```

---

## 📊 Comparação

| Aspecto | PostgreSQL | MongoDB |
|---------|-----------|---------|
| Tipo | Relacional | NoSQL |
| Escalabilidade | Vertical | Horizontal |
| Consultas | SQL | JavaScript |
| Integridade | Referências | Embeddings |
| Segurança | Nativa | Plugins |

**Recomendação**: Use **PostgreSQL** para este projeto (melhor para dados estruturados).

---

## 🔄 Migração de Dados

```javascript
async function migrateToPostgres() {
  const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
  
  for (const user of users) {
    await pool.query(
      'INSERT INTO users (nome, email, senha, token, provider) VALUES ($1, $2, $3, $4, $5)',
      [user.nome, user.email, user.senha, user.token, user.provider]
    );
  }
}
```

Execute uma única vez e depois delete o arquivo `users.json`.

---

## 🚀 Implementação Completa

Veja o ramo `feature/database-migration` para um exemplo completo de migração para PostgreSQL.
