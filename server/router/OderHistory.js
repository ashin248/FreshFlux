const express = require("express");
const Order = require("../schema/Order");
const { isAuthenticated } = require("../middleware/auth");

const orderHistory = express.Router();

orderHistory.get("/", isAuthenticated, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.session.user.id })
      .populate("product", "name price image")
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (err) {
    console.error("Error fetching order history:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = orderHistory;
