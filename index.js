
// index.js generated
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

async function sendText(phone, message) {
  try {
    await API.post("/send-text", { phone, message });
  } catch (e) {
    console.log("Erro sendText:", e.response?.data || e.message);
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
    console.log("Erro sendList:", e.response?.data || e.message);
  }
}

async function sendLocation(phone, lat, lng, title, address) {
  try {
    await API.post("/send-location", { phone, lat, lng, title, address });
  } catch (e) {
    console.log("Erro sendLocation:", e.message);
  }
}

async function menuInicial(phone) {
  const msg =
`💁‍♀️ Olá! Eu sou a *Dentina*, assistente virtual da *Ameclin*.
Como posso te ajudar hoje? `;

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

app.post("/webhook", async (req, res) => {
  console.log("📩 RECEBIDO DA Z-API:", JSON.stringify(req.body, null, 2));

  const data = req.body;
  if (!data || !data.phone) return res.sendStatus(200);

  const phone = data.phone;
  let texto = "";

  if (data.message?.text) {
    texto = data.message.text.toLowerCase().trim();
  }

  const selected = data.message?.selectedRowId;
  const acao = selected || texto;

  if (texto === "oi" || texto === "ola" || texto === "/start" || !texto) {
    await menuInicial(phone);
    return res.sendStatus(200);
  }

  switch (acao) {
    case "agendar":
      await sendText(phone, "Você deseja agendar avaliação?");
      break;
    case "retorno":
      await sendText(phone, "Informe seu nome completo.");
      break;
    case "convenios":
      await sendText(phone, "Convênios Aceitos:\\n- Dental Uni\\n- Amil");
      break;
    case "atendente":
      await sendText(phone, "Chamando atendente...");
      break;
    case "endereco":
      await sendText(phone, "📍 Rua São José dos Pinhais, 200 — Sítio Cercado");
      await sendLocation(phone, -25.5175, -49.2711, "Ameclin", "Ameclin Odontologia");
      break;
    case "horarios":
      await sendText(phone, "🕒 Seg–Sex: 09h–12h / 14h–17h30\\nSáb: 09h–12h");
      break;
    default:
      await menuInicial(phone);
      break;
  }
  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("🤖 Dentina rodando");
});
