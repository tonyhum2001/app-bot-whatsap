const express = require("express");
const webhookRoutes = require("./routes/webhook.routes");
const healthRoutes = require("./routes/health.routes");
const { logger } = require("./utils/logger");

function createApp() {
  const app = express();
  app.use(express.json());

  app.use("/health", healthRoutes);
  app.use("/webhook", webhookRoutes);

  app.use((req, res) => res.status(404).json({ error: "Not found" }));

  app.use((err, req, res, next) => {
    logger.error(err);
    res.status(500).json({ error: "Internal error" });
  });

  return app;
}

function startServer() {
  const app = createApp();
  const port = process.env.PORT || 3000;
  app.listen(port, () => logger.info(`✅ http://localhost:${port}`));
}

module.exports = { createApp, startServer };
