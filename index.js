const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// ===========================================
// CONFIG Z-API
// ===========================================
const INSTANCE = "3EA9E26D9B54A1959179B2694663CF7D";
const ZAPI_TOKEN = "27007D267B55D0B069029678";

const API = axios.create({
  baseURL: `https://api.z-api.io/instances/${INSTANCE}/token/${ZAPI_TOKEN}`,
  headers: {
    "Content-Type": "application/json",
    "client-token": ZAPI_TOKEN
  }
});

// ===========================================
// FUNÇÃO PARA ENVIAR MENSAGEM
// ===========================================
async function sendMessage(phone, message) {
  try {
    const res = await API.post("/send-text", {
      phone,
      message
    });

    console.log("📤 Mensagem enviada:", res.data);
  } catch (err) {
    console.error("❌ Erro ao enviar mensagem:", err.response?.data || err.message);
  }
}

// ===========================================
// ROTA DE WEBHOOK (RECEBE Z-API)
// ===========================================
app.post("/webhook", async (req, res) => {
  console.log("📩 Webhook recebido da Z-API:");
  console.log(JSON.stringify(req.body, null, 2));

  const data = req.body;

  let phone = "";
  let text = "";

  // Formato 1 — comum
  if (data.phone && data.text) {
    phone = data.phone;
    text = data.text;
  }

  // Formato 2 — message.text
  if (data.message?.text) {
    phone = data.message.sender?.replace("@c.us", "");
    text = data.message.text;
  }

  // Formato 3 — array messages
  if (Array.isArray(data.messages) && data.messages.length > 0) {
    const m = data.messages[0];
    phone = m.from?.replace("@c.us", "");
    text = m.text || m.body;
  }

  if (!phone || !text) {
    console.log("⚠️ Ignorado: sem texto ou telefone.");
    return res.sendStatus(200);
  }

  console.log(`📨 Mensagem recebida de ${phone}: ${text}`);

  const lower = text.toLowerCase();

  if (["oi", "ola", "olá", "bom dia", "boa tarde", "boa noite"].includes(lower)) {
    await sendMessage(phone, "Olá! Eu sou a Dentina 🦷✨ Como posso ajudar?");
  } else {
    await sendMessage(phone, "Não entendi, pode repetir?");
  }

  return res.sendStatus(200);
});

// ===========================================
// SERVIDOR (IMPORTANTE! process.env.PORT)
// ===========================================
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
