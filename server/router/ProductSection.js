const express = require("express");
const Product = require("../schema/Prodect");
const { isAuthenticated } = require("../middleware/auth");

const productSection = express.Router();

productSection.get("/", isAuthenticated, async (req, res) => {
  try {
    const { userOnly } = req.query;
    const query =
      userOnly === "true" ? { uploadedBy: req.session.user.id } : {};
    const products = await Product.find(query).populate("uploadedBy", "name");
    res.status(200).json({ products });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = productSection;
