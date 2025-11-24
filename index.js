const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// ================================
// CONFIG Z-API
// ================================
const INSTANCE = "3EA9E26D9B54A1959179B2694663CF7D";
const ZAPI_TOKEN = "27007D267B55D0B069029678";

const API = axios.create({
  baseURL: `https://api.z-api.io/instances/${INSTANCE}/token/${ZAPI_TOKEN}`,
  headers: {
    "Content-Type": "application/json",
    "client-token": ZAPI_TOKEN
  }
});

// ================================
// ENVIAR MENSAGEM
// ================================
async function sendMessage(phone, message) {
  try {
    const result = await API.post("/send-text", { phone, message });
    console.log("📤 Mensagem enviada:", result.data);
  } catch (err) {
    console.error("❌ Erro ao enviar:", err.response?.data || err.message);
  }
}

// ================================
// WEBHOOK (SUPER TOLERANTE)
// ================================
app.post("/webhook", async (req, res) => {
  const body = req.body;

  console.log("📩 Webhook recebido:", JSON.stringify(body, null, 2));

  let phone = "";
  let text = "";

  // 🌐 FORMATO 1 (comum)
  if (body.phone && body.text) {
    phone = body.phone;
    text = body.text;
  }

  // 🌐 FORMATO 2 (multi-device)
  if (body.message?.text) {
    phone = body.message.sender?.replace("@c.us", "");
    text = body.message.text;
  }

  // 🌐 FORMATO 3 (messages array)
  if (body.messages && Array.isArray(body.messages)) {
    const m = body.messages[0];
    if (m) {
      phone = m.from?.replace("@c.us", "");
      text = m.text || m.body;
    }
  }

  if (!phone || !text) {
    console.log("⚠️ Ignorado: sem texto ou número.");
    return res.sendStatus(200);
  }

  console.log(`📨 Mensagem de ${phone}: ${text}`);

  // 🤖 BOT
  const t = text.toLowerCase();

  if (["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite"].includes(t)) {
    await sendMessage(phone, "Olá! Eu sou a Dentina 🦷✨ Como posso ajudar?");
  } else {
    await sendMessage(phone, "Desculpe, não entendi. Pode repetir?");
  }

  res.sendStatus(200);
});

// ================================
// SERVIDOR
// ================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
