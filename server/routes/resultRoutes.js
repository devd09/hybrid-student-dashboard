const express = require("express");
const router = express.Router();
const Result = require("../models/Result");
const Student = require("../models/Student");

// POST /results - Add result for a student
router.post("/", async (req, res) => {
  try {
    const { studentId, semester, subjects } = req.body;

    // Basic validation
    if (!studentId || !semester || !subjects || !Array.isArray(subjects)) {
      return res.status(400).json({ error: "Missing or invalid data." });
    }

    const studentExists = await Student.findById(studentId);
    if (!studentExists) {
      return res.status(404).json({ error: "Student not found." });
    }

    const result = new Result({ studentId, semester, subjects });
    await result.save();
    res.status(201).json({ message: "Result saved successfully.", result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error." });
  }
});

// GET /results/:studentId - Fetch all results for a student
router.get("/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const results = await Result.find({ studentId }).sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch results." });
  }
});

//  PUT /results/:id - Update marks for an existing result
router.put("/:id", async (req, res) => {
  try {
    const { subjects } = req.body;

    if (!subjects || !Array.isArray(subjects)) {
      return res.status(400).json({ error: "Subjects must be an array." });
    }

    const result = await Result.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ error: "Result not found." });
    }

    // Update subjects + recalc (pre-save hook will recalc totals)
    result.subjects = subjects;
    await result.save();

    res.json({ message: "Result updated successfully.", result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not update result." });
  }
});

module.exports = router;
