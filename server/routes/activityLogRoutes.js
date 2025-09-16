// routes/activityLogRoutes.js
const express = require("express");
const router = express.Router();
const ActivityLog = require("../models/ActivityLog");

// Save new log
router.post("/", async (req, res) => {
  try {
    const log = new ActivityLog(req.body);
    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all logs
router.get("/", async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ time: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
