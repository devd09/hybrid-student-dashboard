// test-mongo.js
const mongoose = require("mongoose");

mongoose.connect("mongodb://admin:projectSRD@127.0.0.1:27017/?authSource=admin")
  .then(() => {
    console.log("✅ Mongoose connected successfully");
    return mongoose.connection.close();
  })
  .catch((err) => {
    console.error("❌ Mongoose connection error:", err);
  });
