const mongoose = require("mongoose");

const MongooseConnect = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/FreshFlux", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    throw err;
  }
};

module.exports = MongooseConnect;