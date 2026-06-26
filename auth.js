// ===== CADASTRO =====
async function cadastrar() {
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  if (!nome || !email || !senha) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Erro ao cadastrar usuário.");
      return;
    }

    localStorage.setItem("usuarioLogado", JSON.stringify(data.user));
    localStorage.setItem("authToken", data.token);

    alert("Cadastro realizado com sucesso!");
    window.location.href = "index.html";
  } catch (error) {
    alert("Não foi possível conectar ao servidor. Inicie o backend com node server.js.");
  }
}

// ===== LOGIN =====
async function login() {
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Email ou senha inválidos!");
      return;
    }

    localStorage.setItem("usuarioLogado", JSON.stringify(data.user));
    localStorage.setItem("authToken", data.token);
    window.location.href = "index.html";
  } catch (error) {
    alert("Não foi possível conectar ao servidor. Inicie o backend com node server.js.");
  }
}

async function entrarComGoogle(response) {
  try {
    const payload = response.credential ? JSON.parse(atob(response.credential.split('.')[1])) : null;
    if (!payload) {
      alert("Não foi possível obter os dados do Google.");
      return;
    }

    const res = await fetch("/api/google-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: response.credential, nome: payload.name, email: payload.email })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Erro ao entrar com o Google.");
      return;
    }

    localStorage.setItem("usuarioLogado", JSON.stringify(data.user));
    localStorage.setItem("authToken", data.token);
    window.location.href = "index.html";
  } catch (error) {
    alert("Não foi possível conectar ao servidor. Inicie o backend com node server.js.");
  }
}

window.entrarComGoogle = entrarComGoogle;

async function inicializarGoogleAuth() {
  const button = document.getElementById("google-signin-button");
  if (!button) return;

  try {
    const response = await fetch("/api/google-config");
    const config = await response.json();
    const clientId = config.clientId || window.GOOGLE_CLIENT_ID || "SEU_CLIENT_ID_GOOGLE";

    if (!window.google || !clientId || clientId === "SEU_CLIENT_ID_GOOGLE") {
      button.innerHTML = '<p style="color:#fff; font-size:0.9rem; margin:0;">Configure um Client ID do Google para ativar o login.</p>';
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: entrarComGoogle
    });

    window.google.accounts.id.renderButton(button, {
      theme: "outline",
      size: "large",
      text: "continue_with"
    });
  } catch (error) {
    button.innerHTML = '<p style="color:#fff; font-size:0.9rem; margin:0;">Não foi possível carregar o login com Google.</p>';
  }
}

window.addEventListener("load", inicializarGoogleAuth);
