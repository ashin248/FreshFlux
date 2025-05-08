const express = require("express");

const router = express.Router();

router.post("/", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Failed to logout" });
    }
    res.status(200).json({ message: "Logged out successfully" });
  });
});

module.exports = router;
