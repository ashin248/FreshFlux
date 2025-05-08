const express = require("express");
const auth = express.Router();

auth.get("/check-auth", (req, res) => {
  if (req.session.user) {
    return res
      .status(200)
      .json({ message: "Authenticated", user: req.session.user });
  }
  return res.status(401).json({ message: "Unauthorized" });
});

module.exports = auth;
