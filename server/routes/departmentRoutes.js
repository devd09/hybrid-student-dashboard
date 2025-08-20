const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

// GET /api/departments - Fetch unique departments
router.get("/", async (req, res) => {
  try {
    const departments = await Student.distinct("department");
    // Return them as [{ code, name }]
    const formatted = departments.map(dep => ({
      code: dep,
      name: dep
    }));
    res.json(formatted);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
