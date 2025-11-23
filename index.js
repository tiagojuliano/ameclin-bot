const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

const ZAPI_TOKEN = "27007D267B55D0B069029678";
const INSTANCE = "3EA9E26D9B54A1959179B2694663CF7D";

const API = axios.create({
  baseURL: `https://api.z-api.io/instances/${INSTANCE}/token/${ZAPI_TOKEN}`,
  headers: { "Content-Type": "application/json" }
});

// Enviar texto
async function sendText(phone, message) {
  try {
    await API.post("/send-text", { phone, message });
  } catch (error) {
    console.log("❌ Erro sendText:", error.response?.data || error.message);
  }
}

// Menu Inicial
async function menuInicial(phone) {
  await sendText(phone, "👋 Olá! Eu sou a Dentina. Como posso te ajudar?");
}

// Webhook
app.post("/webhook", async (req, res) => {
  console.log("📩 RECEBIDO DA Z-API:", JSON.stringify(req.body, null, 2));

  const data = req.body;

  // Número
  const phone = data.phone;
  if (!phone) return res.sendStatus(200);

  // Mensagem — novo formato da Z-API
  let texto = "";

  if (data?.text?.message) {
    texto = data.text.message.toLowerCase().trim();
  }

  // Debug: ver texto extraído
  console.log("📌 TEXTO CAPTURADO:", texto);

  // Fluxos
  if (texto === "oi" || texto === "ola" || texto === "bom dia" || texto === "boa tarde") {
    await menuInicial(phone);
    return res.sendStatus(200);
  }

  // Respostas simples
  await sendText(phone, "Recebi sua mensagem: " + texto);

  res.sendStatus(200);
});

// Iniciar servidor
app.listen(3000, () => {
  console.log("🤖 Dentina rodando na porta 3000");
});
