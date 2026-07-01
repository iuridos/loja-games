<<<<<<< HEAD
# 🎮 Iuridos Games - Loja de Jogos Online

Plataforma completa de e-commerce para venda de jogos digitais com autenticação segura, carrinho de compras e integração de pagamentos.

---

## 📋 Requisitos

- **Node.js** v16+ ([Download](https://nodejs.org/))
- **npm** v7+
- Conta **Google** (opcional, para autenticação social)
- Conta **Stripe** (para pagamentos - [Sign Up](https://dashboard.stripe.com))

---

## 🚀 Como Rodar o Projeto

### 1️⃣ Clonar o repositório

```bash
git clone https://github.com/iuridos/loja-games.git
cd loja-games
```

### 2️⃣ Instalar dependências

```bash
npm install
```

### 3️⃣ Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Servidor
PORT=3000

# Google OAuth
GOOGLE_CLIENT_ID=seu_client_id_aqui

# Stripe (pagamentos)
STRIPE_PUBLIC_KEY=pk_test_seu_chave_publica
STRIPE_SECRET_KEY=sk_test_sua_chave_secreta
```

**Como obter as chaves:**

#### Google OAuth
1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto
3. Ative Google+ API
4. Crie credenciais OAuth 2.0
5. Copie o Client ID

#### Stripe
1. Acesse [Stripe Dashboard](https://dashboard.stripe.com)
2. Vá para Settings → API Keys
3. Copie as chaves de teste

### 4️⃣ Iniciar servidor

```bash
npm start
```

O servidor estará rodando em `http://localhost:3000`

---

## 🎯 Funcionalidades

### ✅ Autenticação
- ✓ Cadastro com email e senha
- ✓ Login seguro com hash bcrypt
- ✓ Autenticação via Google
- ✓ Logout seguro
- ✓ Gerenciamento de sessão com tokens

### 🛒 Carrinho de Compras
- ✓ Adicionar/remover produtos
- ✓ Atualizar quantidade
- ✓ Persistência em localStorage
- ✓ Cálculo automático de total

### 💳 Pagamentos
- ✓ Integração com Stripe
- ✓ Modo teste (sem cobrança)
- ✓ Criação de pedidos
- ✓ Histórico de compras

### 👤 Conta do Usuário
- ✓ Visualizar dados pessoais
- ✓ Ver histórico de pedidos
- ✓ Resumo do carrinho
- ✓ Logout

---

## 📁 Estrutura do Projeto

```
loja-games/
├── index.html           # Página inicial
├── jogos.html           # Catálogo de jogos
├── login.html           # Página de login
├── cadastro.html        # Página de cadastro
├── minha-conta.html     # Perfil do usuário
├── checkout.html        # Página de checkout
├── promocoes.html       # Promoções
│
├── server.js            # Backend Node.js
├── auth.js              # Funções de autenticação
├── script.js            # Lógica do carrinho
├── checkout.js          # Processamento de pagamento
├── minha-conta.js       # Gerenciamento de conta
│
├── style.css            # Estilos globais
├── package.json         # Dependências
├── .env                 # Variáveis de ambiente
├── users.json           # Banco de usuários (JSON)
├── orders.json          # Banco de pedidos (JSON)
│
├── imagens/             # Imagens dos jogos
├── video/               # Trailers dos jogos
├── tests/               # Testes do backend
└── README.md            # Este arquivo
```

---

## 🔗 API Endpoints

### Autenticação
```
POST   /api/register           # Cadastrar novo usuário
POST   /api/login              # Fazer login
POST   /api/logout             # Fazer logout
POST   /api/google-auth        # Autenticar com Google
GET    /api/google-config      # Obter configuração do Google
```

### Pedidos
```
GET    /api/pedidos            # Listar pedidos do usuário
POST   /api/pedidos            # Criar novo pedido
GET    /api/pedidos/:id        # Obter detalhes do pedido
DELETE /api/pedidos/:id        # Cancelar pedido
```

### Pagamentos
```
POST   /api/create-payment-intent  # Criar intenção de pagamento (Stripe)
```

**Autenticação**: Use o header `Authorization: Bearer seu_token`

---

## 🧪 Testando a Aplicação

### Teste de Cadastro
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@example.com",
    "senha": "senha123"
  }'
```

### Teste de Login
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "senha": "senha123"
  }'
```

### Teste de Pagamento (Modo Teste)
Use o cartão de teste: **4242 4242 4242 4242**
- Data: 12/25
- CVC: 123

---

## 🧹 Executar Testes

```bash
npm test
```

Os testes verificam:
- ✓ Cadastro de usuários
- ✓ Login e autenticação
- ✓ Criação de pedidos
- ✓ Processamento de pagamentos

---

## 🔒 Segurança

- ✅ Senhas com hash bcrypt (não em texto plano)
- ✅ Tokens criptografados
- ✅ CORS configurado
- ✅ Validação de entrada
- ✅ Proteção de rotas autenticadas
- ✅ Sanitização de paths

---

## 💾 Migração para Banco de Dados Real

Para usar PostgreSQL ou MongoDB em produção, consulte [DATABASE_SETUP.md](./DATABASE_SETUP.md).

---

## 🐛 Troubleshooting

### Erro: "Servidor não respondeu"
- Verifique se o Node.js está instalado: `node --version`
- Verifique se a porta 3000 está disponível
- Tente usar uma porta diferente: `PORT=3001 npm start`

### Erro: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Variáveis de ambiente não carregadas"
- Crie o arquivo `.env` na raiz do projeto
- Reinicie o servidor: `npm start`

### Google Auth não funciona
- Verifique se o `GOOGLE_CLIENT_ID` está correto em `.env`
- Adicione `http://localhost:3000` aos URIs autorizados no Google Cloud

### Stripe retorna erro
- Use as chaves de **teste** (começam com `pk_test_` e `sk_test_`)
- Verifique se as chaves estão em `.env`

---

## 📚 Documentação Adicional

- [Documentação de Stripe](https://stripe.com/docs)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Node.js HTTP Module](https://nodejs.org/docs/latest/api/http.html)
- [bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)

---

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature: `git checkout -b feature/minha-feature`
3. Commit suas mudanças: `git commit -am 'Adiciona minha feature'`
4. Push para a branch: `git push origin feature/minha-feature`
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença ISC.

---

## 👨‍💻 Autor

**Iuridos Games**  
[GitHub](https://github.com/iuridos) | [Issues](https://github.com/iuridos/loja-games/issues)

---

## 📞 Suporte

Tem dúvidas? Abra uma [issue](https://github.com/iuridos/loja-games/issues) ou envie um email para suporte.

**Última atualização**: 26 de junho de 2026  
**Versão**: 1.1.0
=======
# 🛒 Loja de Games

Uma **loja virtual de games** totalmente responsiva desenvolvida com HTML, CSS e JavaScript — ideal para praticar criação de layouts, navegação e interatividade no front-end.

O projeto simula um e-commerce de jogos, com foco em **experiência do usuário (UI/UX)** e organização visual. Inicialmente, o sistema contava com telas de login e formulário, porém essas funcionalidades foram removidas por decisão de arquitetura e regra de negócio (detalhado abaixo).

---

## 📌 Funcionalidades

✔️ Tela inicial com apresentação de jogos  
✔️ Páginas de navegação entre categorias  
✔️ Seções de promoções e área institucional  
✔️ Atendimento direcionado via WhatsApp  
✔️ Layout responsivo para diferentes tamanhos de tela  

---

## 🛠️ Tecnologias Utilizadas

- **HTML5** — estrutura das páginas  
- **CSS3** — estilização e layout responsivo  
- **JavaScript** — interatividade e navegação  
- **Git / GitHub Pages** — versionamento e deploy  

---

## ℹ️ Observação Importante (Regra de Negócio)

As funcionalidades de **login e formulário de cadastro** foram **removidas do front-end**, pois o sistema de autenticação e atendimento foi planejado para ser tratado no **back-end em C#**.

Além disso, o cliente optou por centralizar o atendimento diretamente via **WhatsApp**, tornando desnecessária a permanência dos formulários no front-end neste momento.

Essa decisão reflete uma **adaptação do projeto às necessidades reais do negócio**, priorizando simplicidade, agilidade no atendimento e melhor experiência para o usuário final.

---

## 🚀 Como Visualizar o Projeto

Você pode acessar o projeto online através do GitHub Pages:  
👉 https://iuridos.github.io/loja-games/

Ou executar localmente:

1. Clone o repositório:
   ```bash
   git clone https://github.com/iuridos/loja-games.git
>>>>>>> 28e9800661dbdd8b7ae80083d005974f9c7fdf8b
