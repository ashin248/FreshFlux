const express = require("express");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../schema/User");
const { isAuthenticated } = require("../middleware/auth");

const profileEdit = express.Router();

const uploadDir = path.join(__dirname, "../Uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, `user-${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only images are allowed (jpeg, jpg, png, gif)"));
  },
});

profileEdit.get("/", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

profileEdit.put(
  "/",
  isAuthenticated,
  upload.single("image"),
  async (req, res) => {
    const { name, email, password, number } = req.body;
    const userId = req.session.user.id;

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: "Email already used" });
        }
        user.email = email;
      }

      if (name && name.trim()) user.name = name.trim();
      if (number && number.trim()) user.number = number.trim();
      if (password && password.trim()) {
        user.password = await bcrypt.hash(password.trim(), 10);
      }
      if (req.file) {
        if (user.image) {
          const oldImagePath = path.join(uploadDir, user.image);
          if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
        }
        user.image = req.file.filename;
      }

      await user.save();

      req.session.user = {
        id: user._id,
        email: user.email,
        name: user.name,
        number: user.number,
      };

      res.status(200).json({ message: "Profile updated successfully", user });
    } catch (err) {
      console.error("Profile update error:", err);
      res.status(500).json({ message: err.message || "Server error" });
    }
  }
);

module.exports = profileEdit;
