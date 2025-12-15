// ===== CARRINHO =====  
let carrinho = [];
const listaCarrinho = document.getElementById("lista-carrinho");
const totalElemento = document.getElementById("total");
const finalizarBtn = document.getElementById("finalizar");
const btnCarrinho = document.getElementById("btnCarrinho");
const carrinhoPanel = document.getElementById("carrinho");

// novos elementos
const fecharCarrinho = document.getElementById("fecharCarrinho");
const badge = document.getElementById("badge");

// Mostrar/ocultar carrinho lateral
btnCarrinho?.addEventListener("click", () => {
  carrinhoPanel.classList.toggle("ativo");
});

// Fechar carrinho pelo botão ✖
fecharCarrinho?.addEventListener("click", () => {
  carrinhoPanel.classList.remove("ativo");
});

// Fechar carrinho com tecla ESC
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
    controles.style.display = "flex";
    controles.style.alignItems = "center";
    controles.style.gap = "5px";

    const btnMenos = document.createElement("button");
    btnMenos.textContent = "−";
    btnMenos.addEventListener("click", () => diminuirQtd(index));

    const qtdSpan = document.createElement("span");
    qtdSpan.textContent = item.qtd;

    const btnMais = document.createElement("button");
    btnMais.textContent = "+";
    btnMais.addEventListener("click", () => aumentarQtd(index));

    const btnRemover = document.createElement("button");
    btnRemover.textContent = "❌";
    btnRemover.addEventListener("click", () => removerItem(index));

    controles.append(btnMenos, qtdSpan, btnMais, btnRemover);
    li.append(texto, controles);
    listaCarrinho.appendChild(li);
  });

  totalElemento.textContent = formatPreco(total);
  if (badge) badge.textContent = qtdTotal;
  salvarCarrinho();
}

// Aumentar quantidade
function aumentarQtd(index) {
  carrinho[index].qtd++;
  salvarCarrinho();
  atualizarCarrinho();
}

// Diminuir quantidade
function diminuirQtd(index) {
  if (carrinho[index].qtd > 1) {
    carrinho[index].qtd--;
  } else {
    carrinho.splice(index, 1);
  }
  salvarCarrinho();
  atualizarCarrinho();
}

// Remover item
function removerItem(index) {
  carrinho.splice(index, 1);
  salvarCarrinho();
  atualizarCarrinho();
}

// Finalizar compra
finalizarBtn?.addEventListener("click", () => {
  if (carrinho.length === 0) {
    mostrarMensagem("⚠ Seu carrinho está vazio!");
  } else {
    mostrarMensagem("✅ Compra finalizada com sucesso!");
    carrinho = [];
    salvarCarrinho();
    atualizarCarrinho();
  }
});

// Funções auxiliares
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

// ===== TRAILER FC 26 (com autoplay e som nas próximas visitas) =====
let player;

function onYouTubeIframeAPIReady() {
  player = new YT.Player('fc26Video', {
    events: { 'onReady': onPlayerReady }
  });
}

function onPlayerReady(event) {
  const jaVisitou = localStorage.getItem('jaVisitou');

  if (!jaVisitou) {
    // Cria botão de ativar som (só na 1ª visita)
    const btnSom = document.createElement('button');
    btnSom.textContent = '🔊 Ativar som';
    btnSom.id = 'btnSom';
    document.body.appendChild(btnSom);

    btnSom.addEventListener('click', () => {
      event.target.unMute();
      localStorage.setItem('jaVisitou', 'true');
      btnSom.remove();
    });
  }

  // comportamento do vídeo
  if (jaVisitou) {
    event.target.unMute();
  } else {
    event.target.mute();
  }

  event.target.playVideo();
}
