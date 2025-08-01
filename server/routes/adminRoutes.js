const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
    try {
    const { username, password } = req.body;
    const existing = await Admin.findOne({ username });
    if (existing) return res.status(400).json({ msg: "Username already exists" });

    const newAdmin = new Admin({ username, password });
    await newAdmin.save();

    res.status(201).json({ msg: "Admin registered" });
    } catch (err) {
    res.status(500).json({ error: err.message });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
        expiresIn: "1d"
    });

    res.json({ token, username: admin.username });
    } catch (err) {
    res.status(500).json({ error: err.message });
    }
});

module.exports = router;
