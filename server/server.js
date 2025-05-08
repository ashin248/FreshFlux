
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const login = require("./router/login");
const register = require("./router/register");
const companyUpload = require("./router/ComPanyupload");
const profileEdit = require("./router/ProfileEdit");
const productSection = require("./router/ProductSection");
const orderDetails = require("./router/Orderdetails");
const logout = require("./router/logout");
const chatSection = require("./router/ChatSection");
const orderHistory = require("./router/OderHistory");
const userUploadSection = require("./router/UserUploadSection");
const auth = require("./router/auth");
const MongooseConnect = require("./dataBase/connectDB");

const server = express();
const PORT = process.env.PORT || 3030;

server.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Session configuration
server.use(
  session({
    secret: process.env.SESSION_SECRET || "secure-secret-key-12345",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// Serve static files
const distPath = path.resolve(__dirname, "../client/dist");
const uploadsPath = path.resolve(__dirname, "Uploads");
server.use(express.static(distPath));
server.use("/uploads", express.static(uploadsPath));

// Log paths for debugging
console.log(`Serving static files from: ${distPath}`);
console.log(`Serving uploads from: ${uploadsPath}`);

// Mount routes
server.use("/register", register);
server.use("/login", login);
server.use("/logout", logout);
server.use("/companyUpload", companyUpload);
server.use("/profileEdit", profileEdit);
server.use("/productSection", productSection);
server.use("/orderDetails", orderDetails);
server.use("/chatSection", chatSection);
server.use("/orderHistory", orderHistory);
server.use("/userUploadSection", userUploadSection);
server.use("/auth", auth);

// Catch-all route for React SPA
server.get(
  [
    "/",
    "/register",
    "/login",
    "/logout",
    "/companyUpload",
    "/profileEdit",
    "/productSection",
    "/orderDetails",
    "/orderDetails/:orderId",
    "/chatSection/:orderId",
    "/orderHistory",
    "/userUploadSection",
  ],
  (req, res) => {
    console.log(`Catch-all route triggered for: ${req.originalUrl}`);
    res.sendFile(path.join(distPath, "index.html"), (err) => {
      if (err) {
        console.error(`Error serving index.html: ${err.message}`);
        res.status(500).send("Error serving page");
      }
    });
  }
);

// Test route
server.get("/test", (req, res) => {
  console.log(`Test route triggered for: ${req.originalUrl}`);
  res.send("Test route working");
});

// Start server
server.listen(PORT, async () => {
  console.log(`Starting server on port ${PORT}...`);
  try {
    await MongooseConnect();
    console.log(`✅ Server running on http://localhost:${PORT}`);
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
});