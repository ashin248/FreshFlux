const express = require("express");
const mongoose = require("mongoose");
const Order = require("../schema/Order");
const Product = require("../schema/Prodect");
const { isAuthenticated } = require("../middleware/auth");

const orderDetails = express.Router();

orderDetails.get("/", isAuthenticated, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.session.user.id })
      .populate("product", "name price image")
      .populate("user", "name");
    const validOrders = orders.filter((order) => order.product && order.user);
    console.log(
      `Fetched ${validOrders.length} orders for user ${req.session.user.id}`
    );
    res.status(200).json({ orders: validOrders });
  } catch (err) {
    console.error("Fetch orders error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

orderDetails.post("/order", isAuthenticated, async (req, res) => {
  const { productId } = req.body;
  const userId = req.session.user.id;

  console.log(`POST /order - productId: ${productId}, userId: ${userId}`);

  if (!mongoose.isValidObjectId(productId)) {
    console.error(`Invalid product ID: ${productId}`);
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      console.error(`Product not found: ${productId}`);
      return res.status(404).json({ message: "Product not found" });
    }

    const existingOrder = await Order.findOne({
      user: userId,
      product: productId,
      status: "ordered",
    });
    if (existingOrder) {
      console.error(`Order already exists: ${existingOrder._id}`);
      return res.status(400).json({ message: "Product already ordered" });
    }

    const createdAt = new Date();
    const packingDate = new Date(createdAt.getTime() + 1 * 24 * 60 * 60 * 1000);
    const deliveryDate = new Date(
      createdAt.getTime() + 3 * 24 * 60 * 60 * 1000
    );

    const order = new Order({
      user: userId,
      product: productId,
      status: "ordered",
      packingDate,
      deliveryDate,
      returnStatus: "none",
    });

    await order.save();
    console.log(
      `Order created: ID=${order._id}, Product=${productId}, User=${userId}`
    );
    res.status(201).json({ orderId: order._id });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

orderDetails.post("/cancel/:orderId", isAuthenticated, async (req, res) => {
  const { orderId } = req.params;
  const userId = req.session.user.id;

  console.log(`POST /cancel/:orderId - orderId: ${orderId}, userId: ${userId}`);

  if (!mongoose.isValidObjectId(orderId)) {
    console.error(`Invalid order ID: ${orderId}`);
    return res.status(400).json({ message: "Invalid order ID" });
  }

  try {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      console.error(`Order not found: ${orderId}`);
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.status === "canceled") {
      console.error(`Order already canceled: ${orderId}`);
      return res.status(400).json({ message: "Order already canceled" });
    }

    order.status = "canceled";
    await order.save();
    console.log(`Order canceled: ID=${orderId}, User=${userId}`);
    res.status(200).json({ message: "Order canceled successfully" });
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

orderDetails.post("/return/:orderId", isAuthenticated, async (req, res) => {
  const { orderId } = req.params;
  const userId = req.session.user.id;

  console.log(`POST /return/:orderId - orderId: ${orderId}, userId: ${userId}`);

  if (!mongoose.isValidObjectId(orderId)) {
    console.error(`Invalid order ID: ${orderId}`);
    return res.status(400).json({ message: "Invalid order ID" });
  }

  try {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      console.error(`Order not found: ${orderId}`);
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.status === "canceled") {
      console.error(`Cannot return canceled order: ${orderId}`);
      return res
        .status(400)
        .json({ message: "Cannot return a canceled order" });
    }
    if (order.returnStatus !== "none") {
      console.error(`Return already requested: ${orderId}`);
      return res
        .status(400)
        .json({ message: "Return already requested or processed" });
    }

    order.returnStatus = "requested";
    await order.save();
    console.log(`Return requested: ID=${orderId}, User=${userId}`);
    res.status(200).json({ message: "Return request submitted successfully" });
  } catch (err) {
    console.error("Return order error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

orderDetails.get("/:orderId", isAuthenticated, async (req, res) => {
  const { orderId } = req.params;
  const userId = req.session.user.id;

  console.log(`GET /:orderId - orderId: ${orderId}, userId: ${userId}`);

  if (!mongoose.isValidObjectId(orderId)) {
    console.error(`Invalid order ID: ${orderId}`);
    return res.status(400).json({ message: "Invalid order ID" });
  }

  try {
    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate("product", "name price image")
      .populate("user", "name");
    if (!order) {
      console.error(`Order not found: ${orderId}`);
      return res.status(404).json({ message: "Order not found" });
    }
    if (!order.product || !order.user) {
      console.error(`Incomplete order data: ${orderId}`);
      return res
        .status(404)
        .json({ message: "Order data incomplete (missing product or user)" });
    }
    console.log(`Fetched single order: ID=${orderId}, User=${userId}`);
    res.status(200).json({ order });
  } catch (err) {
    console.error("Order details error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = orderDetails;
