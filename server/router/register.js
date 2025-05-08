const express = require("express");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../schema/User");

const Register = express.Router();

const uploadDir = path.join(__dirname, "../Uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    ),
});

const upload = multer({ storage });

Register.post("/", upload.single("image"), async (req, res) => {
  const { name, email, password, number } = req.body;

  if (!name || !email || !password || !number) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "Email already used" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      number,
      image: req.file?.filename || null,
    });

    await newUser.save();

    req.session.user = { id: newUser._id, email, name };

    res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = Register;
