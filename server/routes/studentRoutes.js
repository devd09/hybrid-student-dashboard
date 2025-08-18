// server/routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Result = require("../models/Result"); // Import Result model

// GET all students 
router.get("/", async (req, res) => {
  console.log(" /api/students hit");
  try {
    const student = await Student.find();
    console.log(student);
    res.json(student);
  } catch (err) {
    console.error(" Failed to fetch students:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST new student with validation 
router.post("/", async (req, res) => {
  try {
    const { name, roll, semester, subjects, email, password, department } = req.body;

    // Validate required fields
    if (!name || !roll || !semester || !Array.isArray(subjects) || subjects.length === 0 || !email || !password || !department) {
      return res.status(400).json({ error: "Name, roll, semester, department, email, password, and at least one subject are required." });
    }

    // Check if roll number already exists
    const existing = await Student.findOne({ roll });
    if (existing) {
      return res.status(409).json({ error: "Roll number already exists." });
    }

    // Create new student
    const student = new Student({ name, roll, semester, subjects, email, password, department });
    await student.save();

    // Automatically generate result for the student
    const resultSubjects = subjects.map(sub => ({
      name: sub.name,
      marks: sub.marks,
      maxMarks: sub.maxMarks || 100
    }));

    const result = new Result({
      studentId: student._id,
      semester: semester.toString(),
      subjects: resultSubjects
    });
    await result.save();

    res.status(201).json({ student, result });
  } catch (err) {
    console.error("Error adding student:", err);
    res.status(500).json({ error: "Server error.", details: err.message });
  }
});

// PUT update marks by student roll number 
router.put("/roll/:roll/marks", async (req, res) => {
  try {
    const { roll } = req.params;
    const { subjects } = req.body;

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ error: "Subjects array is required." });
    }

    // Find the student by roll number
    const student = await Student.findOne({ roll });
    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }

    // Find and update the result
    const result = await Result.findOne({ studentId: student._id });
    if (!result) {
      return res.status(404).json({ error: "Result not found for student." });
    }

    // Replace subjects and trigger pre-save hook
    result.subjects = subjects;
    await result.save();
    
    res.json({ message: "Marks updated successfully", result });
  } catch (err) {
    console.error("Error updating marks by roll:", err);
    res.status(500).json({ error: "Server error.", details: err.message });
  }
});
// GET student by roll number
router.get("/roll/:roll", async (req, res) => {
  try {
    const student = await Student.findOne({ roll: req.params.roll });
    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }
    res.json(student);
  } catch (err) {
    console.error("Error fetching student by roll:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// PUT update student details by roll
router.put("/roll/:roll", async (req, res) => {
  try {
    const updated = await Student.findOneAndUpdate(
      { roll: req.params.roll },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ message: "Student updated", student: updated });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});


// DELETE student by roll number 
router.delete("/roll/:roll", async (req, res) => {
  try {
    const { roll } = req.params;

    // Find student by roll number
    const student = await Student.findOne({ roll });
    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }

    // Delete the student
    await Student.deleteOne({ roll });

    // Also delete associated result
    await Result.deleteMany({ studentId: student._id });

    res.json({ message: `Student with roll ${roll} deleted successfully.` });
  } catch (err) {
    console.error("Error deleting student:", err);
    res.status(500).json({ error: "Server error.", details: err.message });
  }
});

module.exports = router;