/********************************************************************
 * DENTINA – BOT AMECLIN (Z-API NOVO FORMATO)
 ********************************************************************/

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

/* =========================
   CONFIG Z-API
============================ */

const ZAPI_TOKEN = "27007D267B55D0B069029678";
const INSTANCE = "3EA9E26D9B54A1959179B2694663CF7D";

const API = axios.create({
  baseURL: `https://api.z-api.io/instances/${INSTANCE}/token/${ZAPI_TOKEN}`,
  headers: { "Content-Type": "application/json" }
});

/* =========================
   FUNÇÕES ÚTEIS
============================ */

async function sendText(phone, message) {
  try {
    await API.post("/send-text", { phone, message });
    console.log("📤 Enviado:", message);
  } catch (e) {
    console.log("❌ Erro sendText:", e.response?.data || e.message);
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

/* =========================
   MENU PRINCIPAL
============================ */

async function enviarMenu(phone) {
  const msg = `💁‍♀️ Olá! Eu sou a *Dentina* da *Ameclin*.
Como posso te ajudar hoje?`;

  const sections = [
    {
      title: "Serviços",
      rows: [
        { id: "agendar", title: "🗓️ Agendar Avaliação" },
        { id: "retorno", title: "🔄 Retorno" },
        { id: "convenios", title: "🧾 Convênios" },
        { id: "atendente", title: "👩‍⚕️ Falar com atendente" },
        { id: "endereco", title: "📍 Endereço" },
        { id: "horarios", title: "🕒 Horários" }
      ]
    }
  ];

  await sendList(phone, msg, "Menu Ameclin", "Abrir", sections);
}

/* =========================
   WEBHOOK
============================ */

app.post("/webhook", async (req, res) => {

  console.log("📩 RECEBIDO DA Z-API:", JSON.stringify(req.body, null, 2));

  const data = req.body;

  const phone = data.phone;
  if (!phone) return res.sendStatus(200);

  // Z-API NOVA → texto vem aqui:
  let texto = "";
  if (data.text?.message) {
    texto = data.text.message.toLowerCase().trim();
  }

  // Z-API NOVA → list / buttons
  const selected = data.selectedRowId || data.message?.selectedRowId;

  const acao = selected || texto;

  // INICIAR MENU
  if (["oi", "ola", "menu", "/start", ""].includes(texto)) {
    await enviarMenu(phone);
    return res.sendStatus(200);
  }

  // AÇÕES
  switch (acao) {
    case "agendar":
      await sendText(phone, "Vamos agendar sua avaliação. Qual é o seu nome completo?");
      break;

    case "retorno":
      await sendText(phone, "Certo! Informe seu nome completo para buscar seu retorno.");
      break;

    case "convenios":
      await sendText(phone, "Convênios aceitos:\n🟢 Dental Uni\n🟢 Amil");
      break;

    case "atendente":
      await sendText(phone, "Ok! Vou chamar nossa atendente para você. Aguarde um momento.");
      break;

    case "endereco":
      await sendText(phone, "📍 Rua São José dos Pinhais, 200 — Sítio Cercado");
      break;

    case "horarios":
      await sendText(phone, "🕒 Seg–Sex: 09h–12h / 14h–17h30\nSáb: 09h–12h");
      break;

    default:
      await enviarMenu(phone);
      break;
  }

  res.sendStatus(200);
});

/* =========================
   INICIAR SERVIDOR
============================ */

app.listen(process.env.PORT || 3000, () => {
  console.log("🤖 Dentina rodando na porta:", process.env.PORT || 3000);
});
