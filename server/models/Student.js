const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  marks: { type: Number, required: true, min: 0, max: 100 }
});

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roll: { type: String, required: true, unique: true },
  semester: { type: Number, required: true },
  subjects: [subjectSchema],
  totalMarks: { type: Number },
  percentage: { type: Number },
  result: { type: String }
});

// Pre-save middleware to calculate result
studentSchema.pre("save", function (next) {
  if (!this.subjects || this.subjects.length === 0) {
    this.totalMarks = 0;
    this.percentage = 0;
    this.result = "Fail";
  } else {
    const total = this.subjects.reduce((sum, subj) => sum + subj.marks, 0);
    const percent = total / this.subjects.length;
    this.totalMarks = total;
    this.percentage = percent;
    this.result = percent >= 33 ? "Pass" : "Fail";
  }
  next();
});

module.exports = mongoose.model("Student", studentSchema, "students");
