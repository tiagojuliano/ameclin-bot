const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

// CONFIG
const ZAPI_TOKEN = "27007D267B55D0B069029678";
const INSTANCE = "3EA9E26D9B54A1959179B2694663CF7D";

const API = axios.create({
  baseURL: `https://api.z-api.io/instances/${INSTANCE}/token/${ZAPI_TOKEN}`,
  headers: { "Content-Type": "application/json" }
});

// ENVIAR TEXTO
async function sendText(phone, text) {
  try {
    await API.post("/send-text", {
      phone,
      message: { text }
    });
    console.log("📤 Enviado:", text);
  } catch (e) {
    console.log("❌ Erro sendText:", e.response?.data || e.message);
  }
}

// MENU INICIAL
async function menuInicial(phone) {
  await sendText(
    phone,
    "💁‍♀️ Olá! Eu sou a *Dentina*, assistente virtual da *Ameclin*. Como posso te ajudar?"
  );
}

// WEBHOOK
app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    // o campo correto que contém texto é ESTE:
    const phone = body.phone || body.from;
    const text = body.text?.message || body.text?.body || null;

    if (text) {
      console.log("📩 Recebido:", text);
      await menuInicial(phone);
    }

    res.sendStatus(200);
  } catch (e) {
    console.log("❌ Erro webhook:", e.message);
    res.sendStatus(500);
  }
});

app.listen(3000, () => console.log("🚀 Dentina rodando na porta 3000"));
