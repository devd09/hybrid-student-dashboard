// server/routes/courseRoutes.js
const express = require("express");
const router = express.Router();
const Course = require("../models/Course");

// GET /api/courses?department=CSE&semester=1
router.get("/", async (req, res) => {
  try {
    const { department, semester } = req.query;
    if (!department || !semester) {
      return res.status(400).json({ error: "department and semester are required query params" });
    }
    const courses = await Course.find({ department, semester: Number(semester) }).sort({ code: 1 });
    res.json(courses || []);
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

module.exports = router;
