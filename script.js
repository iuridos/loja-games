// ===== CARRINHO =====
let carrinho = [];

const listaCarrinho = document.getElementById("lista-carrinho");
const totalElemento = document.getElementById("total");
const finalizarBtn = document.getElementById("finalizar");
const btnCarrinho = document.getElementById("btnCarrinho");
const carrinhoPanel = document.getElementById("carrinho");
const fecharCarrinho = document.getElementById("fecharCarrinho");
const badge = document.getElementById("badge");

// Abrir / fechar carrinho
btnCarrinho?.addEventListener("click", () => {
  carrinhoPanel.classList.toggle("ativo");
});

fecharCarrinho?.addEventListener("click", () => {
  carrinhoPanel.classList.remove("ativo");
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") carrinhoPanel.classList.remove("ativo");
});

// Carregar carrinho salvo
window.addEventListener("load", () => {
  const salvo = localStorage.getItem("carrinho");
  if (salvo) {
    carrinho = JSON.parse(salvo);
    atualizarCarrinho();
  }
});

// Adicionar produto
document.querySelectorAll(".comprar").forEach(botao => {
  botao.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;

    const nome = card.querySelector("h3")?.textContent ?? "Produto";
    const preco = parsePreco(card.querySelector(".preco")?.textContent ?? "0");

    const existente = carrinho.find(item => item.nome === nome);
    if (existente) {
      existente.qtd++;
    } else {
      carrinho.push({ nome, preco, qtd: 1 });
    }

    salvarCarrinho();
    atualizarCarrinho();
    mostrarMensagem(`${nome} adicionado ao carrinho!`);
    carrinhoPanel.classList.add("ativo");
  });
});

// Atualizar carrinho
function atualizarCarrinho() {
  if (!listaCarrinho) return;

  listaCarrinho.innerHTML = "";
  let total = 0;
  let qtdTotal = 0;

  carrinho.forEach((item, index) => {
    total += item.preco * item.qtd;
    qtdTotal += item.qtd;

    const li = document.createElement("li");

    const texto = document.createElement("span");
    texto.textContent = `${item.nome} - R$ ${formatPreco(item.preco * item.qtd)}`;

    const controles = document.createElement("div");

    const btnMenos = document.createElement("button");
    btnMenos.textContent = "−";
    btnMenos.onclick = () => diminuirQtd(index);

    const qtdSpan = document.createElement("span");
    qtdSpan.textContent = item.qtd;

    const btnMais = document.createElement("button");
    btnMais.textContent = "+";
    btnMais.onclick = () => aumentarQtd(index);

    const btnRemover = document.createElement("button");
    btnRemover.textContent = "❌";
    btnRemover.onclick = () => removerItem(index);

    controles.append(btnMenos, qtdSpan, btnMais, btnRemover);
    li.append(texto, controles);
    listaCarrinho.appendChild(li);
  });

  if (totalElemento) totalElemento.textContent = formatPreco(total);
  if (badge) badge.textContent = qtdTotal;

  salvarCarrinho();
}

function aumentarQtd(index) {
  carrinho[index].qtd++;
  atualizarCarrinho();
}

function diminuirQtd(index) {
  if (carrinho[index].qtd > 1) {
    carrinho[index].qtd--;
  } else {
    carrinho.splice(index, 1);
  }
  atualizarCarrinho();
}

function removerItem(index) {
  carrinho.splice(index, 1);
  atualizarCarrinho();
}

// Finalizar compra
finalizarBtn?.addEventListener("click", async () => {
  if (carrinho.length === 0) {
    mostrarMensagem("⚠ Seu carrinho está vazio!");
    return;
  }

  const token = localStorage.getItem("authToken");
  if (!token) {
    mostrarMensagem("⚠ Faça login para finalizar a compra.");
    window.location.href = "login.html";
    return;
  }

  // Redirecionar para página de checkout
  window.location.href = "checkout.html";
});
    atualizarCarrinho();
  } catch (error) {
    mostrarMensagem("⚠ Não foi possível conectar ao servidor.");
  }
});

// Utilidades
function parsePreco(texto) {
  return parseFloat(texto.replace("R$", "").replace(",", ".")) || 0;
}

function formatPreco(valor) {
  return valor.toFixed(2).replace(".", ",");
}

function salvarCarrinho() {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function mostrarMensagem(texto) {
  const msg = document.createElement("div");
  msg.textContent = texto;

  Object.assign(msg.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: "#e0ffff",
    color: "#000",
    padding: "10px 15px",
    borderRadius: "6px",
    fontWeight: "bold",
    zIndex: "2000",
    boxShadow: "0 0 10px #e0ffff",
    fontFamily: "Orbitron, sans-serif"
  });

  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 2000);
}

// ===== TRAILER FC 26 =====
let player;

function onYouTubeIframeAPIReady() {
  player = new YT.Player("fc26Video", {
    events: { onReady: onPlayerReady }
  });
}

function onPlayerReady(event) {
  const jaVisitou = localStorage.getItem("jaVisitou");

  if (!jaVisitou) {
    const btnSom = document.createElement("button");
    btnSom.id = "btnSom";
    btnSom.textContent = "🔊 Ativar som";
    document.body.appendChild(btnSom);

    btnSom.onclick = () => {
      event.target.unMute();
      localStorage.setItem("jaVisitou", "true");
      btnSom.remove();
    };

    event.target.mute();
  } else {
    event.target.unMute();
  }

  event.target.playVideo();
}

// ===== AUTENTICAÇÃO =====
function verificarAutenticacao() {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  return usuarioLogado != null;
}

async function fazerLogout() {
  const token = localStorage.getItem("authToken");
  
  if (!token) {
    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("authToken");
    localStorage.removeItem("carrinho");
    window.location.href = "index.html";
    return;
  }

  try {
    await fetch("/api/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
  }

  localStorage.removeItem("usuarioLogado");
  localStorage.removeItem("authToken");
  localStorage.removeItem("carrinho");
  mostrarMensagem("✅ Você foi desconectado!");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1000);
}

window.fazerLogout = fazerLogout;
