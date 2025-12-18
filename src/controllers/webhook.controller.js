const { inboundExists, saveInbound, saveOutbound } = require("../repositories/messages.repo");
const { sendTextMessage } = require("../services/whatsapp.service");
const { buildReplyForMessage } = require("../services/business.service");

// GET /webhook (verificación)
function verifyWebhook(req, res) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
}

// POST /webhook (mensajes entrantes)
async function receiveWebhook(req, res, next) {
  try {
    // 1) Responder rápido a Meta
    res.sendStatus(200);

    // 2) Parsear lo mínimo del payload
    const value = req.body?.entry?.[0]?.changes?.[0]?.value;
    const msg = value?.messages?.[0];
    if (!msg) return;

    const parsed = parseIncomingMessage(msg, req.body);
    if (!parsed) return;

    // 3) Deduplicación
    if (await inboundExists(parsed.messageId)) return;

    // 4) Guardar inbound
    await saveInbound(parsed);

    // 5) Consultar BD / lógica (PostGIS, reglas, etc)
    const replyText = await buildReplyForMessage(parsed);

    // 6) Responder por WhatsApp
    await sendTextMessage(parsed.from, replyText);

    // 7) Guardar outbound
    await saveOutbound({ to: parsed.from, text: replyText });
  } catch (err) {
    next(err);
  }
}

function parseIncomingMessage(msg, rawBody) {
  const from = msg.from;        // número
  const messageId = msg.id;     // único
  const type = msg.type;        // text / location / etc

  if (!from || !messageId || !type) return null;

  if (type === "text") {
    return {
      messageId,
      from,
      type,
      text: msg.text?.body || "",
      lat: null,
      lon: null,
      raw: rawBody
    };
  }

  if (type === "location") {
    return {
      messageId,
      from,
      type,
      text: null,
      lat: msg.location?.latitude ?? null,
      lon: msg.location?.longitude ?? null,
      raw: rawBody
    };
  }

  return { messageId, from, type, text: null, lat: null, lon: null, raw: rawBody };
}

module.exports = { verifyWebhook, receiveWebhook };
