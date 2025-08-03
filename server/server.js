require("dotenv").config();
console.log("Connecting to:", process.env.MONGO_URL);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");
const resultRoutes = require("./routes/resultRoutes");

app.use("/api/admin", adminRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/results", resultRoutes);

// Health check route
app.get("/", (req, res) => {
  res.send("Student Dashboard Backend is Running");
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB connected");

    // Start server only after DB connection
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
