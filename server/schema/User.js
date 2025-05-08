const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  number: { type: String, required: true },
  image: { type: String, default: null },
  lastLogin: { type: Date },
});

module.exports = mongoose.model("User", userSchema);

