// server/routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

// Get all students
router.get("/", async (req, res) => {
  console.log("📩 /api/students hit");
  try {
    const student = await Student.find(); // instead of .find()
    console.log(student)
    res.json(student);
  } catch (err) {
    console.error("❌ Failed to fetch students:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// Add new student with validation
router.post("/", async (req, res) => {
  try {
    const { name, roll, semester, subjects } = req.body;

    if (!name || !roll || !semester || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ error: "Name, roll, semester, and at least one subject are required." });
    }

    const existing = await Student.findOne({ roll });
    if (existing) {
      return res.status(409).json({ error: "Roll number already exists." });
    }
    
    const student = new Student({ name, roll, semester, subjects });
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ error: "Server error.", details: err.message });
  }
});

module.exports = router;
