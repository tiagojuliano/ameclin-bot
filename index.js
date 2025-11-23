const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

// CONFIG DA Z-API
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
    console.log("📤 Enviado para:", phone);
  } catch (e) {
    console.log("❌ Erro sendText:", e.response?.data || e.message);
  }
}

// MENU PRINCIPAL
async function menuInicial(phone) {
  await sendText(
    phone,
    "💁‍♀️ Olá! Eu sou a *Dentina*, assistente virtual da *Ameclin*. Como posso te ajudar?"
  );
}

// WEBHOOK CORRETO PARA O SEU FORMATO REAL
app.post("/webhook", async (req, res) => {
  console.log("📩 RECEBIDO:", JSON.stringify(req.body, null, 2));

  try {
    const data = req.body;

    // Número do remetente
    const phone = data.phone;

    // TEXTO REAL RECEBIDO — SEU FORMATO VERDADEIRO
    const texto =
      data?.text?.message || data?.text?.body || data?.message || "";

    if (!phone || !texto) {
      console.log("⚠️ Sem texto ou telefone");
      return res.sendStatus(200);
    }

    console.log(`📥 Mensagem de ${phone}: ${texto}`);

    // Responder
    await menuInicial(phone);

    return res.sendStatus(200);
  } catch (e) {
    console.log("❌ ERRO NO WEBHOOK:", e);
    return res.sendStatus(500);
  }
});

app.listen(3000, () => {
  console.log("🤖 Dentina rodando na porta 3000");
});
