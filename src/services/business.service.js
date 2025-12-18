const { findAreaByPoint } = require("../repositories/areas.repo");

async function buildReplyForMessage(parsedMsg) {
  if (parsedMsg.type === "location") {
    const area = await findAreaByPoint(parsedMsg.lon, parsedMsg.lat);
    if (!area) return "No pude ubicar tu zona. Probá reenviar la ubicación.";
    return `Recibí tu ubicación. Estás en la zona: ${area}.`;
  }

  if (parsedMsg.type === "text") {
    const t = (parsedMsg.text || "").trim().toLowerCase();
    if (t.includes("hola")) return "Hola 👋 Enviame tu ubicación para verificar tu zona.";
    return "Recibí tu mensaje. Si querés verificar tu zona, enviame tu ubicación.";
  }

  return `Recibí un mensaje tipo: ${parsedMsg.type}`;
}

module.exports = { buildReplyForMessage };
