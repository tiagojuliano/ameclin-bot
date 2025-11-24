const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// ==================================
// CONFIG DA SUA Z-API
// ==================================
const INSTANCE = "3EA9E26D9B54A1959179B2694663CF7D";
const ZAPI_TOKEN = "27007D267B55D0B069029678";

// ==================================
// CLIENT DA API Z-API
// ==================================
const API = axios.create({
  baseURL: `https://api.z-api.io/instances/${INSTANCE}/token/${ZAPI_TOKEN}`,
  headers: {
    "Content-Type": "application/json",
    "client-token": ZAPI_TOKEN
  }
});

// ==================================
// FUNÇÃO PARA ENVIAR MENSAGEM
// ==================================
async function sendMessage(phone, message) {
  try {
    const resp = await API.post("/send-text", {
      phone,
      message
    });
    console.log("📤 Mensagem enviada:", resp.data);
  } catch (err) {
    console.error("❌ Erro ao enviar:", err.response?.data || err.message);
  }
}

// ==================================
// WEBHOOK - TRATAMENTO UNIVERSAL
// ==================================
app.post("/webhook", async (req, res) => {
  const body = req.body;

  console.log("📩 Webhook recebido:", JSON.stringify(body, null, 2));

  let phone = "";
  let text = "";

  //
  // 🔥 Z-API FORMATO 1
  //
  if (body.phone && body.text) {
    phone = body.phone;
    text = body.text;
  }

  //
  // 🔥 Z-API FORMATO 2 (multi device)
  //
  if (body.message?.text) {
    text = body.message.text;
    phone = body.message.sender?.replace("@c.us", "");
  }

  //
  // 🔥 Z-API FORMATO 3 (lista messages)
  //
  if (body.messages && Array.isArray(body.messages)) {
    const msg = body.messages[0];
    if (msg) {
      text = msg.text || msg.body || "";
      phone = msg.from?.replace("@c.us", "") || "";
    }
  }

  //
  // ⚠️ NENHUMA MENSAGEM FOI ENCONTRADA
  //
  if (!phone || !text) {
    console.log("⚠️ Ignorado: sem número ou sem texto.");
    return res.sendStatus(200);
  }

  console.log(`📨 Mensagem de ${phone}: ${text}`);

  //
  // 🤖 RESPOSTA DO BOT
  //
  const t = text.toLowerCase().trim();

  if (["oi", "ola", "olá", "bom dia", "boa tarde", "boa noite"].includes(t)) {
    await sendMessage(phone, "Olá! Eu sou a Dentina 🦷✨ Como posso ajudar?");
  } else {
    await sendMessage(phone, "Desculpe, não entendi. Pode repetir?");
  }

  res.sendStatus(200);
});

// ==================================
// SERVIDOR
// ==================================
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
