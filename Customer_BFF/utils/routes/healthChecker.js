//js
const express = require("express");
const router = express.Router({});

router.get("/", async (_req, res, _next) => {
  try {
    // GET /status that responds with a plain text message saying “OK”.
    // (Plain text message means the response should have Content-Type: text/plain)
    res.set("Content-Type", "text/plain");
    res.send("OK");
  } catch (error) {
    res.status(503).send("Health Check failed");
  }
});

// export router with all routes included
module.exports = router;
