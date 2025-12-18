const router = require("express").Router();
const { verifyWebhook, receiveWebhook } = require("../controllers/webhook.controller");

router.get("/", verifyWebhook);
router.post("/", receiveWebhook);

module.exports = router;
