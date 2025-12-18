const { pool } = require("../db/pool");

async function findAreaByPoint(lon, lat) {
  const r = await pool.query(
    `SELECT nombre
     FROM areas
     WHERE ST_Contains(geom, ST_SetSRID(ST_Point($1,$2), 4326))
     LIMIT 1`,
    [lon, lat]
  );
  return r.rows[0]?.nombre || null;
}

module.exports = { findAreaByPoint };
