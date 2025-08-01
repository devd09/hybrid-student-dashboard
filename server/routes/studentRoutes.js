// server/routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

// Get all students
router.get("/", async (req, res) => {
    const students = await Student.find();
    res.json(students);
});

// Add new student
router.post("/", async (req, res) => {
    const newStudent = new Student(req.body);
    await newStudent.save();
    res.status(201).json(newStudent);
});

module.exports = router;
