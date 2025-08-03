// server/models/Department.js
const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
    name: String,
    code: String, // e.g., CSE, ECE
});

module.exports = mongoose.model("Department", departmentSchema);
