const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Company = require("../schema/Company");
const Product = require("../schema/Prodect");
const { isAuthenticated } = require("../middleware/auth");

const companyUpload = express.Router();

const uploadDir = path.join(__dirname, "../Uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    ),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only images (jpeg, jpg, png, gif) and PDFs are allowed"));
  },
});

companyUpload.post(
  "/",
  isAuthenticated,
  upload.fields([
    { name: "documents", maxCount: 10 },
    { name: "productImages", maxCount: 10 },
  ]),
  async (req, res) => {
    const {
      name,
      location,
      currentLocation,
      description,
      ownerName,
      contactNumber,
      products,
    } = req.body;

    const userId = req.session.user.id;

    try {
      if (
        !name ||
        !location ||
        !currentLocation ||
        !description ||
        !ownerName ||
        !contactNumber
      ) {
        return res
          .status(400)
          .json({ message: "All company fields are required" });
      }

      let parsedProducts = [];
      if (products) {
        try {
          parsedProducts = JSON.parse(products);
        } catch (err) {
          return res.status(400).json({ message: "Invalid products format" });
        }
      }

      const documentFiles =
        req.files.documents?.map((file) => file.filename) || [];
      const productImageFiles = req.files.productImages || [];

      if (parsedProducts.length !== productImageFiles.length) {
        return res
          .status(400)
          .json({
            message: "Number of product images must match number of products",
          });
      }

      const companyProducts = parsedProducts.map((product, index) => ({
        name: product.name,
        image: productImageFiles[index]?.filename || "",
        price: parseFloat(product.price) || 0,
        description: product.description || "",
      }));

      const company = new Company({
        name,
        location,
        documents: documentFiles,
        currentLocation,
        description,
        ownerName,
        contactNumber,
        products: companyProducts,
        createdBy: userId,
      });

      await company.save();

      // Save each product to the Product collection
      for (let i = 0; i < parsedProducts.length; i++) {
        const product = parsedProducts[i];
        const productImage = productImageFiles[i]?.filename || "";
        if (product.name && productImage && product.price) {
          const newProduct = new Product({
            name: product.name,
            image: productImage,
            price: parseFloat(product.price),
            description: product.description || "",
            uploadedBy: userId,
          });
          await newProduct.save();
        }
      }

      res
        .status(201)
        .json({ message: "Company and products uploaded successfully" });
    } catch (err) {
      console.error("Company upload error:", err);
      res.status(500).json({ message: err.message || "Server error" });
    }
  }
);

module.exports = companyUpload;
