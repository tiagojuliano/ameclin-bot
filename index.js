const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// ---------------------------------------
// CONFIG Z-API (INSIRA OS SEUS DADOS)
// ---------------------------------------
const INSTANCE = "3EA9E26D9B54A1959179B2694663CF7D";
const TOKEN = "27007D267B55D0B069029678";

const api = axios.create({
    baseURL: `https://api.z-api.io/instances/${INSTANCE}/token/${TOKEN}`,
    headers: { "Content-Type": "application/json" }
});

// ---------------------------------------
// ROTA WEBHOOK OFICIAL — NÃO ALTERAR
// ---------------------------------------
app.post("/webhook", async (req, res) => {
    console.log("📩 Webhook recebido:");
    console.log(JSON.stringify(req.body, null, 2));

    const message = req.body;

    // Pega o número e o texto (como exemplo oficial)
    const phone = message.phone || message.sender || message.messages?.[0]?.from || "";
    const text =
        message.text ||
        message.body ||
        message.message?.text ||
        message.messages?.[0]?.text ||
        "";

    if (!phone || !text) {
        console.log("⚠️ Webhook recebido mas sem dados válidos.");
        return res.sendStatus(200);
    }

    console.log(`📨 ${phone}: ${text}`);

    // Enviar resposta simples (exemplo oficial)
    try {
        await api.post("/send-text", {
            phone,
            message: "Recebi sua mensagem! Este é um teste do exemplo oficial da Z-API."
        });

        console.log("📤 Mensagem enviada com sucesso!");
    } catch (err) {
        console.error("❌ Erro ao enviar mensagem:", err.response?.data || err.message);
    }

    res.sendStatus(200);
});

// ---------------------------------------
// SERVIDOR (Railway usa process.env.PORT)
// ---------------------------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Servidor oficial Z-API rodando na porta ${PORT}`);
});
