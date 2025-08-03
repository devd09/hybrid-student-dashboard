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
