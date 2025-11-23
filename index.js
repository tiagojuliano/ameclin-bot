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

// WEBHOOK (AQUI LEMOS O FORMATO REAL DA SUA Z-API)
app.post("/webhook", async (req, res) => {
  console.log("📩 RECEBIDO DA Z-API:", JSON.stringify(req.body, null, 2));

  const data = req.body;

  // PEGA TELEFONE
  const phone = data.phone || data?.text?.phone;
  if (!phone) return res.sendStatus(200);

  // PEGA O TEXTO DA MENSAGEM ***AQUI ESTÁ O SEGREDO***
  const textoRecebido =
    data?.text?.message ||   // FORMATO REAL DO SEU LOG
    data?.message?.text ||   // FORMATO ANTIGO
    data?.message ||         // CASO VENHA PURO
    "";

  const texto = textoRecebido.toLowerCase().trim();

  // INÍCIO DE CONVERSA
  if (["oi", "ola", "/start", "bom dia", "boa tarde", "boa noite"].includes(texto)) {
    await menuInicial(phone);
    return res.sendStatus(200);
  }

  // RESPOSTAS BÁSICAS
  if (texto.includes("agendar")) {
    await sendText(phone, "Vamos agendar sua avaliação! Qual especialidade deseja?");
    return res.sendStatus(200);
  }

  if (texto.includes("endereco") || texto.includes("endereço")) {
    await sendText(phone, "📍 Rua São José dos Pinhais, 200 — Sítio Cercado");
    return res.sendStatus(200);
  }

  // SE NÃO RECONHECE → MENU
  await menuInicial(phone);
  res.sendStatus(200);
});

// INICIAR
app.listen(3000, () => console.log("🤖 Dentina rodando no Railway"));
