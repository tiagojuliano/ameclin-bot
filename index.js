const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// 🔐 CONFIG DA Z-API (SEUS DADOS REAIS)
const ZAPI_TOKEN = "27007D267B55D0B069029678";
const INSTANCE = "3EA9E26D9B54A1959179B2694663CF7D";

// 🔗 API CLIENT
const API = axios.create({
  baseURL: `https://api.z-api.io/instances/${INSTANCE}/token/${ZAPI_TOKEN}`,
  headers: {
    "Content-Type": "application/json",
    "client-token": ZAPI_TOKEN
  }
});

// 📤 FUNÇÃO PARA ENVIAR MENSAGEM
async function sendText(phone, message) {
  try {
    const response = await API.post("/send-text", { phone, message });
    console.log("📤 Enviado com sucesso:", response.data);
  } catch (error) {
    console.error("❌ Erro ao enviar:", error.response?.data || error.message);
  }
}

// 📩 WEBHOOK (FORMATO REAL DA SUA Z-API)
app.post("/webhook", async (req, res) => {
  try {
    const data = req.body;

    console.log("📩 RECEBIDO DA Z-API --->", JSON.stringify(data, null, 2));

    // 🟢 Validação correta baseado nos SEUS LOGS
    if (!data.text || !data.text.message) {
      console.log("⚠️ Não é mensagem de texto.");
      return res.sendStatus(200);
    }

    const message = data.text.message.trim();
    const phone = data.phone;

    console.log(`📨 Mensagem recebida de ${phone}: ${message}`);

    // 🤖 RESPOSTA DO BOT
    if (["oi", "olá", "ola"].includes(message.toLowerCase())) {
      await sendText(phone, "Olá, eu sou a *Dentina*! Como posso ajudar?");
    } else {
      await sendText(phone, "Desculpe, não entendi. Você pode repetir?");
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Erro no webhook:", error.message);
    res.sendStatus(500);
  }
});

// 🚀 SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
