// server/routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Student = require("../models/Student");
const Result = require("../models/Result");
const Course = require("../models/Course");

// -------------------- GET all students --------------------
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().sort({ department: 1, roll: 1 });
    res.json(students);
  } catch (err) {
    console.error("Failed to fetch students:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------- GET one student by roll --------------------
router.get("/roll/:roll", async (req, res) => {
  try {
    const student = await Student.findOne({ roll: req.params.roll });
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// -------------------- PUT update student details by roll --------------------
router.put("/roll/:roll", async (req, res) => {
  try {
    const updated = await Student.findOneAndUpdate(
      { roll: req.params.roll },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student updated", student: updated });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// -------------------- DELETE student by roll (also deletes results) --------------------
router.delete("/roll/:roll", async (req, res) => {
  try {
    const student = await Student.findOne({ roll: req.params.roll });
    if (!student) return res.status(404).json({ error: "Student not found" });

    await Student.deleteOne({ _id: student._id });
    await Result.deleteMany({ studentId: student._id });

    res.json({ message: `Student ${req.params.roll} deleted` });
  } catch (err) {
    console.error("Error deleting student:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// -------------------- PUT update marks by roll (recalculates result via pre-save) --------------------
router.put("/roll/:roll/marks", async (req, res) => {
  try {
    const { roll } = req.params;
    const { subjects } = req.body;
    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ error: "Subjects array is required." });
    }

    const student = await Student.findOne({ roll });
    if (!student) return res.status(404).json({ error: "Student not found." });

    const result = await Result.findOne({ studentId: student._id });
    if (!result) return res.status(404).json({ error: "Result not found for student." });

    result.subjects = subjects; // triggers pre-save totals/percentage/status
    await result.save();

    res.json({ message: "Marks updated successfully", result });
  } catch (err) {
    console.error("Error updating marks by roll:", err);
    res.status(500).json({ error: "Server error.", details: err.message });
  }
});

/**
 * -------------------- POST /api/students/auto --------------------
 * Creates a new student by only providing:
 *  - name
 *  - department
 *  - marks: [{ name: <course name>, marks: <number> }, ...]   (optional)
 * Logic:
 *  - semester = 1
 *  - roll = <DEPT><3-digit next number> (e.g., CSE031)
 *  - email = <roll lowercased>@example.com
 *  - rawPassword = <First><Last><Roll>  (same pattern as your seeder)
 *  - password stored hashed
 *  - Result auto-created with subjects from marks (or zero if not sent)
 */
router.post("/auto", async (req, res) => {
  try {
    const { name, department, marks = [] } = req.body;

    if (!name || !department) {
      return res.status(400).json({ error: "name and department are required" });
    }

    const semester = 1;

    // Find next roll number in that department
    const last = await Student.find({ department })
      .sort({ roll: -1 })
      .limit(1);

    let nextNum = 1;
    if (last.length > 0) {
      // roll format DEPT### -> take last 3 digits
      const lastRoll = last[0].roll;
      const numStr = lastRoll.replace(department, "");
      const parsed = parseInt(numStr, 10);
      if (!isNaN(parsed)) nextNum = parsed + 1;
    }
    const roll = `${department}${String(nextNum).padStart(3, "0")}`;

    const email = `${roll.toLowerCase()}@example.com`;

    // Raw password per your seeding rule: FirstLastRoll (remove spaces)
    const [first = "", ...rest] = name.split(" ");
    const lastName = rest.join("") || "";
    const rawPassword = `${first}${lastName}${roll}`.replace(/\s+/g, "");

    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Create student
    const student = await Student.create({
      name,
      roll,
      email,
      password: hashedPassword,
      semester,
      department
    });

    // Determine subjects: if marks provided, use names/maxMarks; else preload from Course
    let subjectDocs = [];
    if (Array.isArray(marks) && marks.length > 0) {
      subjectDocs = marks.map(m => ({
        name: m.name,
        marks: Number(m.marks) || 0,
        maxMarks: Number(m.maxMarks) || 100
      }));
    } else {
      const courses = await Course.find({ department, semester }).sort({ code: 1 });
      subjectDocs = courses.map(c => ({ name: c.name, marks: 0, maxMarks: 100 }));
    }

    // Create Result (pre-save hook will compute totals)
    const result = await Result.create({
      studentId: student._id,
      semester: String(semester),
      subjects: subjectDocs
    });

    res.status(201).json({
      message: "Student created",
      // return these so UI can show them immediately
      _id: student._id,
      name: student.name,
      roll: student.roll,
      email: student.email,
      department: student.department,
      semester: student.semester,
      result
    });
  } catch (err) {
    console.error("Error in /auto:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

module.exports = router;
