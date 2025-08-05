const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Get the Authorization header
  const authHeader = req.header("Authorization");

  // Extract token from "Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1];

  // If no token, deny access
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the role is admin
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin access only" });
    }

    // Add admin data to request object
    req.admin = decoded;

    // Continue to the protected route
    next();
  } catch (err) {
    // Token is invalid or expired
    return res.status(400).json({ error: "Invalid token" });
  }
};
