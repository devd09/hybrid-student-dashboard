// server/models/Semester.js
const mongoose = require("mongoose");

const semesterSchema = new mongoose.Schema({
    number: Number,
    year: String,
});

module.exports = mongoose.model("Semester", semesterSchema);
