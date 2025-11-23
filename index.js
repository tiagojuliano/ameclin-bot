// index.js - versão completa, revisada e pronta para deploy na Railway

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

// CONFIGURAÇÃO DA Z-API
const ZAPI_TOKEN = "27007D267B55D0B069029678"; 
const INSTANCE = "3EA9E26D9B54A1959179B2694663CF7D";

const API = axios.create({
  baseURL: `https://api.z-api.io/instances/${INSTANCE}/token/${ZAPI_TOKEN}`,
  headers: { "Content-Type": "application/json" }
});

// ----------------------------
// FUNÇÕES DE ENVIO
// ----------------------------

async function sendText(phone, text) {
  await API.post("/send-text", {
    phone,
    message: text
  });
}

async function sendMenu(phone, text, options) {
  await API.post("/send-list-message", {
    phone,
    message: text,
    buttonText: "Selecionar",
    sections: [
      {
        title: "Opções",
        rows: options.map(opt => ({
          title: opt.title,
          rowId: opt.id
        }))
      }
    ]
  });
}

// ----------------------------
// MENUS
// ----------------------------

async function menuInicial(phone) {
  await sendMenu(phone, "Olá, eu sou a *Dentina*! Como posso ajudar hoje?", [
    { id: "agendar", title: "📅 Agendar consulta" },
    { id: "endereco", title: "📍 Endereço" },
    { id: "contato", title: "📞 Contato" },
    { id: "horarios", title: "🕒 Horários de atendimento" }
  ]);
}

// ----------------------------
// ROTAS Z-API WEBHOOK
// ----------------------------

app.post("/webhook", async (req, res) => {
  try {
    const data = req.body;

    if (!data?.message?.text) {
      return res.sendStatus(200);
    }

    const phone = data.message.phone;
    const msg = data.message.text.trim().toLowerCase();

    console.log("📥 Mensagem recebida:", msg);

    switch (msg) {
      case "oi":
      case "menu":
      case "início":
      case "inicio":
        await menuInicial(phone);
        break;

      case "agendar":
        await sendText(phone, "📅 Para agendamentos, envie uma mensagem para nossa equipe:\n👉 *41 99900-0000*");
        break;

      case "endereco":
      case "endereço":
        await sendText(phone, "📍 Estamos na Rua Exemplo, 123 – Curitiba/PR");
        break;

      case "contato":
        await sendText(phone, "📞 Telefone/WhatsApp: *41 99900-0000*");
        break;

      case "horarios":
        await sendText(phone, "🕒 Segunda a Sexta: 09h–12h / 14h–17h30\nSábado: 09h–12h");
        break;

      default:
        await menuInicial(phone);
        break;
    }

    res.sendStatus(200);

  } catch (err) {
    console.error("Erro no webhook:", err);
    res.sendStatus(500);
  }
});

// ----------------------------
// INICIAR SERVIDOR
// ----------------------------

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🤖 Dentina rodando na porta " + PORT);
});
