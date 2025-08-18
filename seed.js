const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const Admin = require("./server/models/Admin");
const Student = require("./server/models/Student");
const Course = require("./server/models/Course");
const Result = require("./server/models/Result");
const Department = require("./server/models/Department");
const Semester = require("./server/models/Semester");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/resultportal";

const departments = [
  { code: "CSE", name: "Computer Science" },
  { code: "ECE", name: "Electronics and Communication" },
  { code: "ME", name: "Mechanical Engineering" },
  { code: "CIV", name: "Civil Engineering" },
  { code: "IT", name: "Information Technology" },
];

const coursesPerSemester = {
  1: ["Mathematics I", "Physics I", "Introduction to Programming"],
  2: ["Data Structures", "Engineering Mechanics", "Basic Electronics"]
};

const firstNames = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan",
  "Diya", "Anaya", "Myra", "Ira", "Aadhya", "Avni", "Saanvi", "Meera", "Kiara", "Pari"
];
const lastNames = [
  "Sharma", "Verma", "Patel", "Reddy", "Nair", "Choudhary", "Kumar", "Yadav", "Singh", "Das"
];

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(" Connected to MongoDB");

    await Promise.all([
        Admin.deleteMany({}),
        Department.deleteMany({}),
        Semester.deleteMany({}),
        Course.deleteMany({}),
        Student.deleteMany({}),
        Result.deleteMany({}),
        ]);


    const semesters = [];
    for (let i = 1; i <= 2; i++) {
      const sem = await Semester.create({ number: i, year: "2025" });
      semesters.push(sem);
    }

    const deptMap = {};
    for (const dept of departments) {
      const d = await Department.create(dept);
      deptMap[dept.code] = d;

      for (const sem of semesters) {
        const courseNames = coursesPerSemester[sem.number];
        for (let i = 0; i < courseNames.length; i++) {
          await Course.create({
            code: `${dept.code}${sem.number}0${i + 1}`,
            name: courseNames[i],
            department: dept.code,
            semester: sem.number
          });
        }
      }
    }

    for (const dept of departments) {
      const semester = 1;
      const courseNames = coursesPerSemester[semester];

      for (let i = 1; i <= 30; i++) {
        const first = firstNames[Math.floor(Math.random() * firstNames.length)];
        const last = lastNames[Math.floor(Math.random() * lastNames.length)];
        const fullName = `${first} ${last}`;
        const roll = `${dept.code}${String(i).padStart(3, '0')}`;
        const email = `${roll.toLowerCase()}@example.com`;
        const rawPassword = `${first}${last}${roll}`;
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        const student = await Student.create({
          name: fullName,
          roll,
          email,
          password: hashedPassword,
          semester,
          department: dept.code
        });

        const subjects = courseNames.map(name => ({
          name,
          marks: Math.floor(Math.random() * 41) + 60,
          maxMarks: 100
        }));

        await Result.create({
          studentId: student._id,
          semester: semester.toString(),
          subjects
        });
      }
    }

    const adminPassword = await bcrypt.hash("admin123", 10);
    await Admin.create({ username: "admin", password: adminPassword });

    console.log(" Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error(" Error during seeding:", err);
    process.exit(1);
  }
})();
