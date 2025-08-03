// server/models/Course.js
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    code: String,       // e.g., "CS101"
    name: String,       // e.g., "Data Structures"
    department: String, // or ObjectId ref if related to Department
    semester: Number,
});

module.exports = mongoose.model("Course", courseSchema);
