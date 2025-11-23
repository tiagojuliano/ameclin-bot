/********************************************************************
 * DENTINA - BOT AMECLIN (Z-API) – VERSÃO FINAL AJUSTADA AO WEBHOOK REAL
 ********************************************************************/

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

/* =======================
   CONFIG DA Z-API
========================== */

const ZAPI_TOKEN = "27007D267B55D0B069029678";
const INSTANCE = "3EA9E26D9B54A1959179B2694663CF7D";

const API = axios.create({
  baseURL: `https://api.z-api.io/instances/${INSTANCE}/token/${ZAPI_TOKEN}`,
  headers: { "Content-Type": "application/json" }
});

/* =======================
   ENVIO DE MENSAGENS
========================== */

async function sendText(phone, message) {
  try {
    await API.post("/send-text", { phone, message });
    console.log("📤 Enviado:", message);
  } catch (e) {
    console.log("❌ Erro ao enviar:", e.response?.data || e.message);
  }
}

async function sendList(phone, message, title, buttonText, sections) {
  try {
    await API.post("/send-list", {
      phone,
      message,
      title,
      buttonText,
      sections
    });
  } catch (e) {
    console.log("❌ Erro sendList:", e.response?.data || e.message);
  }
}

async function sendLocation(phone, lat, lng, title, address) {
  try {
    await API.post("/send-location", { phone, lat, lng, title, address });
  } catch (e) {
    console.log("❌ Erro sendLocation:", e.message);
  }
}

/* =======================
   MENU PRINCIPAL
========================== */

async function menuInicial(phone) {
  const msg =
`💁‍♀️ Olá! Eu sou a *Dentina*, assistente virtual da *Ameclin*.
Como posso te ajudar hoje?`;

  const sections = [
    {
      title: "Serviços",
      rows: [
        { id: "agendar", title: "🗓️ Agendar Avaliação" },
        { id: "retorno", title: "🔄 Retorno" },
        { id: "convenios", title: "🧾 Convênios" },
        { id: "atendente", title: "👩‍⚕️ Falar com Atendente" },
        { id: "endereco", title: "📍 Endereço" },
        { id: "horarios", title: "🕒 Horários" }
      ]
    }
  ];

  await sendList(phone, msg, "Menu Ameclin", "Abrir", sections);
}

/* =======================
   WEBHOOK AJUSTADO AO LOG REAL
========================== */

app.post("/webhook", async (req, res) => {

  console.log("📩 WEBHOOK RECEBIDO:", JSON.stringify(req.body, null, 2));

  const data = req.body;

  // TELEFONE
  const phone = data.phone || data?.message?.phone;
  if (!phone) {
    console.log("⚠️ Sem número no webhook.");
    return res.sendStatus(200);
  }

  // TEXTO (ajustado ao formato real do log)
  let texto = "";

  if (data.text?.message) {
    texto = data.text.message.toLowerCase().trim();   // FORMATO REAL DO SEU LOG
  }

  if (data.message && typeof data.message === "string") {
    texto = data.message.toLowerCase().trim();        // OUTRO FORMATO QUE VOCÊ RECEBEU
  }

  const selected = data?.message?.selectedRowId;
  const acao = selected || texto;

  console.log("🔥 TEXTO CAPTURADO:", texto);
  console.log("🔥 AÇÃO:", acao);

  // INÍCIO 
  if (texto === "oi" || texto === "ola" || texto === "/start") {
    await menuInicial(phone);
    return res.sendStatus(200);
  }

  switch (acao) {
    case "agendar":
      await sendText(phone, "Você deseja agendar avaliação ou limpeza?");
      break;

    case "retorno":
      await sendText(phone, "Informe seu nome completo para localizar seu retorno.");
      break;

    case "convenios":
      await sendText(phone, "Convênios Aceitos:\n- Dental Uni\n- Amil");
      break;

    case "atendente":
      await sendText(phone, "Chamando uma atendente, por favor aguarde. 😊");
      break;

    case "endereco":
      await sendText(phone, "📍 Rua São José dos Pinhais, 200 — Sítio Cercado");
      await sendLocation(phone, -25.5175, -49.2711, "Ameclin", "Ameclin Odontologia");
      break;

    case "horarios":
      await sendText(phone, "🕒 Seg–Sex: 09h–12h / 14h–17h30\nSáb: 09h–12h");
      break;

    default:
      await menuInicial(phone);
      break;
  }

  res.sendStatus(200);
});

/* =======================
   SERVIDOR
========================== */

app.listen(3000, () => {
  console.log("🚀 Dentina Online na Porta 3000");
});
