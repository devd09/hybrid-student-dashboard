// server/models/Student.js
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    name: String,
    roll: String,
    marks: Number
});

module.exports = mongoose.model("Student", studentSchema);
