// ===== PROTEÇÃO DE PÁGINA =====
const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

if (!usuario) {
  alert("Você precisa estar logado para acessar esta página.");
  window.location.href = "login.html";
}

// ===== MOSTRAR DADOS DO USUÁRIO =====
document.getElementById("nomeUsuario").textContent = usuario.nome;
document.getElementById("emailUsuario").textContent = usuario.email;

// ===== RESUMO DO CARRINHO =====
const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
const lista = document.getElementById("resumoCarrinho");
const totalSpan = document.getElementById("totalCarrinho");

let total = 0;

carrinho.forEach(item => {
  const li = document.createElement("li");
  li.textContent = `${item.nome} (${item.qtd}x)`;
  lista.appendChild(li);

  total += item.preco * item.qtd;
});

totalSpan.textContent = total.toFixed(2).replace(".", ",");
