// server/models/Admin.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Hash password before saving
adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model("Admin", adminSchema);

// server/models/Course.js
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    code: String,       // e.g., "CS101"
    name: String,       // e.g., "Data Structures"
    department: String, // or ObjectId ref if related to Department
    semester: Number,
});

module.exports = mongoose.model("Course", courseSchema);


// server/models/Department.js
const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
    name: String,
    code: String, // e.g., CSE, ECE
});

module.exports = mongoose.model("Department", departmentSchema);



// server/models/Result.js
const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    marks: { type: Number, required: true, min: 0 },
    maxMarks: { type: Number, required: true, default: 100 }
});

const resultSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    semester: { type: String, required: true },
    subjects: [subjectSchema],
    totalMarks: Number,
    percentage: Number,
    status: { type: String, enum: ["pass", "fail"], default: "pass" },
    createdAt: { type: Date, default: Date.now }
    });

    // Auto-calculate total, percentage, and status before saving
    resultSchema.pre("save", function (next) {
    const result = this;
    const total = result.subjects.reduce((sum, sub) => sum + sub.marks, 0);
    const maxTotal = result.subjects.reduce((sum, sub) => sum + sub.maxMarks, 0);
    result.totalMarks = total;
    result.percentage = ((total / maxTotal) * 100).toFixed(2);

    // Status: if any subject < 35% of its maxMarks → fail
    result.status = result.subjects.some(sub => sub.marks < 0.35 * sub.maxMarks)
        ? "fail"
        : "pass";

    next();
});

module.exports = mongoose.model("Result", resultSchema);



// server/models/Semester.js
const mongoose = require("mongoose");

const semesterSchema = new mongoose.Schema({
    number: Number,
    year: String,
});

module.exports = mongoose.model("Semester", semesterSchema);


const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roll: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  semester: { type: Number, required: true },
  department: { type: String, required: true }
});

module.exports = mongoose.model("Student", studentSchema, "students");

