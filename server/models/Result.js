// server/models/Result.js
const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    marks: {
    type: Number,
    required: true,
    min: [0, "Marks must be at least 0"],
    max: [100, "Marks cannot exceed 100"]
    }
});

const resultSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    semester: { type: Number, required: true },
    year: { type: String, required: true },
    subjects: { type: [subjectSchema], required: true },
    totalMarks: Number,
    percentage: Number,
    grade: String
});

// Auto-calculate total, percentage, and grade before saving
resultSchema.pre("save", function (next) {
    const total = this.subjects.reduce((sum, subj) => sum + subj.marks, 0);
    const count = this.subjects.length;
    this.totalMarks = total;
    this.percentage = count > 0 ? total / count : 0;

  // Grade logic
    if (this.percentage >= 90) this.grade = "A+";
    else if (this.percentage >= 80) this.grade = "A";
    else if (this.percentage >= 70) this.grade = "B";
    else if (this.percentage >= 60) this.grade = "C";
    else if (this.percentage >= 50) this.grade = "D";
    else this.grade = "F";

    next();
});

module.exports = mongoose.model("Result", resultSchema);
