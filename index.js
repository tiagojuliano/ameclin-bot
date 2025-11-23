const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// CONFIGURAÇÕES DA Z-API
const ZAPI_TOKEN = "SEU_TOKEN_AQUI"; // Substitua pelo seu token
const INSTANCE = "SUA_INSTANCIA_AQUI"; // Substitua pela sua instância

const API = axios.create({
  baseURL: `https://api.z-api.io/instances/${INSTANCE}/token/${ZAPI_TOKEN}`,
  headers: {
    "Content-Type": "application/json",
    "client-token": ZAPI_TOKEN
  }
});

// FUNÇÃO PARA ENVIAR MENSAGEM DE TEXTO
async function sendText(phone, message) {
  try {
    const response = await API.post("/send-text", { phone, message });
    console.log("📤 Mensagem enviada:", response.data);
  } catch (error) {
    console.error("❌ Erro ao enviar mensagem:", error.response?.data || error.message);
  }
}

// WEBHOOK PARA RECEBER MENSAGENS
app.post("/webhook", async (req, res) => {
  try {
    const message = req.body;

    console.log("📩 Mensagem recebida:", message);

    // Verifica se é uma mensagem de texto
    if (message && message.text && message.text.message) {
      const phone = message.phone; // Número do remetente
      const text = message.text.message.trim(); // Texto da mensagem

      console.log(`📩 Mensagem de ${phone}: ${text}`);

      // Responde automaticamente
      if (text.toLowerCase() === "oi" || text.toLowerCase() === "olá") {
        await sendText(phone, "Olá! Eu sou um bot de teste. Como posso te ajudar?");
      } else {
        await sendText(phone, "Desculpe, não entendi sua mensagem.");
      }
    }

    res.sendStatus(200); // Retorna sucesso para a Z-API
  } catch (error) {
    console.error("❌ Erro no webhook:", error.message);
    res.sendStatus(500); // Retorna erro para a Z-API
  }
});
