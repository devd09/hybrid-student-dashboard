require("dotenv").config();
console.log("Connecting to:", process.env.MONGO_URL);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");
const resultRoutes = require("./routes/resultRoutes");
const courseRoutes = require("./routes/courseRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const activityLogRoutes = require("./routes/activityLogRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/api/courses", courseRoutes);

// API Routes
app.use("/api/admin", adminRoutes);       // Admin login, etc.
app.use("/api/students", studentRoutes);  // Student login/dashboard
app.use("/api/results", resultRoutes);    // Results fetch/create/update
app.use("/api/departments", departmentRoutes); // Departments fetch
app.use("/api/activity-log", activityLogRoutes); // Activity log routes
app.use("/api/students", studentRoutes); // Student Login 
// Health check route
app.get("/", (req, res) => {
  res.send(" Student Dashboard Backend is Running");
});

// Enable Mongoose debug logs (shows raw queries)
mongoose.set("debug", true);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(" MongoDB connected");

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(` Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(" MongoDB connection error:", err.message);
  });
