/********************************************************************
 * DENTINA - BOT AMECLIN (Z-API NOVA ESTRUTURA 2025)
 ********************************************************************/

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

/* ================================================================
   CONFIG DA Z-API
=================================================================== */

const INSTANCE = "3EA9E26D9B54A1959179B2694663CF7D";
const TOKEN = "27007D267B55D0B069029678";

// NOVO ENDPOINT
const API = axios.create({
  baseURL: `https://api.z-api.io/instances/${INSTANCE}/token/${TOKEN}`,
  headers: {
    "Content-Type": "application/json"
  }
});

/* ================================================================
   FUNÇÕES DE ENVIO
=================================================================== */

async function sendText(phone, text) {
  try {
    await API.post("/send/text", {
      phone,
      message: text
    });
    console.log("📤 Texto enviado ->", phone);
  } catch (e) {
    console.log("❌ ERRO SENDTEXT:", e.response?.data || e.message);
  }
}

async function sendList(phone, body, title, button, sections) {
  try {
    await API.post("/send/list", {
      phone,
      message: body,
      title,
      buttonText: button,
      sections
    });
    console.log("📤 Lista enviada ->", phone);
  } catch (e) {
    console.log("❌ ERRO SENDLIST:", e.response?.data || e.message);
  }
}

/* ================================================================
   MENU
=================================================================== */

async function menuInicial(phone) {
  await sendList(
    phone,
    "💁‍♀️ Olá! Eu sou a *Dentina*, assistente virtual da *Ameclin*.\nComo posso te ajudar?",
    "Menu Ameclin",
    "Abrir Menu",
    [
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
    ]
  );
}

/* ================================================================
   WEBHOOK
=================================================================== */

app.post("/webhook", async (req, res) => {
  console.log("📩 RECEBIDO:", JSON.stringify(req.body, null, 2));

  const data = req.body;

  // O NOVO JSON coloca o texto em:
  // data.text.message

  const phone = data.phone;
  if (!phone) return res.sendStatus(200);

  const msg = data.text?.message?.toLowerCase()?.trim() || "";
  const selected = data?.message?.selectedRowId;

  const acao = selected || msg;

  if (acao === "oi" || acao === "ola" || acao === "/start" || !acao) {
    await menuInicial(phone);
    return res.sendStatus(200);
  }

  switch (acao) {
    case "agendar":
      await sendText(phone, "Você deseja agendar avaliação inicial?");
      break;

    case "retorno":
      await sendText(phone, "Informe seu nome completo por favor.");
      break;

    case "convenios":
      await sendText(phone, "Convênios:\n- Dental Uni\n- Amil");
      break;

    case "atendente":
      await sendText(phone, "Chamando atendente...");
      break;

    case "endereco":
      await sendText(phone, "📍 Rua São José dos Pinhais, 200 — Sítio Cercado");
      break;

    case "horarios":
      await sendText(phone, "🕒 Seg–Sex: 09h–12h / 14h–17h30\nSáb: 09h–12h");
      break;

    default:
      await menuInicial(phone);
  }

  res.sendStatus(200);
});

/* ================================================================
   START
=================================================================== */

app.listen(3000, () =>
  console.log("🤖 Dentina rodando na versão Z-API nova 🚀")
);
