const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

// CONFIG DA Z-API
const ZAPI_TOKEN = "27007D267B55D0B069029678"; // Substitua pelo seu token
const INSTANCE = "3EA9E26D9B54A1959179B2694663CF7D"; // Substitua pela sua instância

const API = axios.create({
  baseURL: `https://api.z-api.io/instances/${INSTANCE}/token/${ZAPI_TOKEN}`,
  headers: { "Content-Type": "application/json" }
});

// ENVIAR TEXTO
async function sendText(phone, message) {
  try {
    await API.post("/send-text", { phone, message });
    console.log("📤 Mensagem enviada para:", phone);
  } catch (e) {
    console.log("❌ Erro ao enviar mensagem:", e.response?.data || e.message);
  }
}

// MENU PRINCIPAL
async function menuInicial(phone) {
  const message = `
💁‍♀️ Olá! Eu sou a *Dentina*, assistente virtual da *Ameclin*. Como posso te ajudar?

1️⃣ - Agendar consulta
2️⃣ - Informações sobre a clínica
3️⃣ - Falar com um atendente
  `;
  await sendText(phone, message);
}

// RESPOSTAS AUTOMÁTICAS
async function responderMensagem(phone, text) {
  if (text === "1") {
    await sendText(phone, "📅 Para agendar uma consulta, entre em contato pelo telefone: (43) 3771-0050.");
  } else if (text === "2") {
    await sendText(phone, "🏥 A Ameclin está localizada na Rua Saúde, 123. Nosso horário de atendimento é de segunda a sexta, das 8h às 18h.");
  } else if (text === "3") {
    await sendText(phone, "📞 Um atendente entrará em contato com você em breve. Obrigado!");
  } else {
    await sendText(phone, "❓ Desculpe, não entendi sua mensagem. Por favor, escolha uma das opções do menu.");
    await menuInicial(phone); // Reenvia o menu inicial
  }
}

// WEBHOOK (RECEBE MENSAGENS)
app.post("/webhook", async (req, res) => {
  try {
    const message = req.body;

    // Verifica se é uma mensagem de texto recebida
    if (message && message.text && message.text.body) {
      const phone = message.from; // Número do remetente
      const text = message.text.body.trim(); // Texto da mensagem

      console.log(`📩 Mensagem recebida de ${phone}: ${text}`);

      // Responde com base no texto recebido
      if (text.toLowerCase() === "oi" || text.toLowerCase() === "olá") {
        await menuInicial(phone); // Envia o menu inicial
      } else {
        await responderMensagem(phone, text); // Responde com base na opção escolhida
      }
    }

    res.sendStatus(200); // Retorna sucesso para a Z-API
  } catch (e) {
    console.log("❌ Erro no webhook:", e.message);
    res.sendStatus(500); // Retorna erro para a Z-API
  }
});

// INICIA O SERVIDOR
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
