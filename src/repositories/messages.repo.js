const { pool } = require("../db/pool");

async function inboundExists(messageId) {
  const r = await pool.query("SELECT 1 FROM inbound_messages WHERE message_id=$1 LIMIT 1", [messageId]);
  return r.rowCount > 0;
}

async function saveInbound({ messageId, from, type, text, lat, lon, raw }) {
  await pool.query(
    `INSERT INTO inbound_messages (message_id, wa_from, msg_type, text_body, latitude, longitude, raw_json)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (message_id) DO NOTHING`,
    [messageId, from, type, text || null, lat ?? null, lon ?? null, raw || null]
  );
}

async function saveOutbound({ to, text }) {
  await pool.query(
    `INSERT INTO outbound_messages (wa_to, text_body) VALUES ($1,$2)`,
    [to, text]
  );
}

module.exports = { inboundExists, saveInbound, saveOutbound };
