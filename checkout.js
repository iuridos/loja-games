// ===== STRIPE CHECKOUT =====

// Inicializar Stripe
const stripe = Stripe(process.env.STRIPE_PUBLIC_KEY || 'pk_test_placeholder');
const elements = stripe.elements();
const cardElement = elements.create('card');

async function inicializarCheckout() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    alert("Você precisa estar logado para finalizar a compra.");
    window.location.href = "login.html";
    return;
  }

  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }

  // Calcular total
  let total = 0;
  carrinho.forEach(item => {
    total += item.preco * item.qtd;
  });

  try {
    // Criar payment intent
    const response = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ amount: total })
    });

    const data = await response.json();
    
    if (!data.ok) {
      alert("Erro ao processar pagamento: " + (data.message || "Erro desconhecido"));
      return;
    }

    // Modo de teste - sem card
    if (data.message && data.message.includes("teste")) {
      alert("Modo teste ativado! Pagamento simulado.\n\nEm produção, use Stripe.");
      await finalizarPedido(token, carrinho, total);
      return;
    }

    // Em produção, usar Stripe
    // const { clientSecret } = data;
    // ... (implementar confirmação de pagamento com Stripe)

  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao processar pagamento");
  }
}

async function finalizarPedido(token, items, total) {
  try {
    const response = await fetch("/api/pedidos", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ items, total })
    });

    const data = await response.json();

    if (!data.ok) {
      alert("Erro ao criar pedido: " + (data.message || "Erro desconhecido"));
      return;
    }

    alert("✅ Pedido criado com sucesso!\nID: " + data.order.id);
    localStorage.removeItem("carrinho");
    window.location.href = "minha-conta.html";

  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao finalizar pedido");
  }
}

window.inicializarCheckout = inicializarCheckout;
window.finalizarPedido = finalizarPedido;
