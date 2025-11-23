const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

// CONFIG Z-API
const ZAPI_TOKEN = "27007D267B55D0B069029678";
const INSTANCE = "3EA9E26D9B54A1959179B2694663CF7D";

const API = axios.create({
  baseURL: `https://api.z-api.io/instances/${INSTANCE}/token/${ZAPI_TOKEN}`,
  headers: { "Content-Type": "application/json" }
});

// ENVIAR TEXTO
async function sendText(phone, message) {
  try {
    await API.post("/send-text", { phone, message });
    console.log("📤 Resposta enviada para:", phone);
  } catch (e) {
    console.log("❌ Erro ao enviar:", e.response?.data || e.message);
  }
}

// MENU
async function menuInicial(phone) {
  await sendText(
    phone,
    "💁‍♀️ Olá! Eu sou a *Dentina*, assistente virtual da *Ameclin*.\nComo posso te ajudar?"
  );
}

// WEBHOOK COMPATÍVEL COM O SEU FORMATO REAL
app.post("/webhook", async (req, res) => {
  try {
    console.log("📩 RECEBIDO DA Z-API:", JSON.stringify(req.body, null, 2));

    const body = req.body;

    // Texto chega AQUI (pelos seus logs):
    const text = body?.text?.message;
    const phone = body?.phone;

    // Se faltar algo, não tenta responder
    if (!text || !phone) {
      return res.sendStatus(200);
    }

    const msg = text.trim().toLowerCase();

    // Fluxo inicial
    if (msg === "oi" || msg === "ola" || msg === "bom dia" || msg === "boa tarde") {
      await menuInicial(phone);
      return res.sendStatus(200);
    }

    // Padrão
    await sendText(phone, "Desculpe, não consegui entender. Digite *oi* para ver o menu 😊");

    res.sendStatus(200);

  } catch (e) {
    console.log("❌ Erro no webhook:", e.message);
    res.sendStatus(500);
  }
});

// INICIAR SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🤖 Dentina rodando no Railway");
});
