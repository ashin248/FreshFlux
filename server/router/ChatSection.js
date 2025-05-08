
const express = require("express");
const mongoose = require("mongoose");
const Message = require("../schema/chatSchema");
const Order = require("../schema/Order");
const { isAuthenticated } = require("../middleware/auth.js");

const chatSection = express.Router();

// GET messages for a specific order
chatSection.get("/:orderId", isAuthenticated, async (req, res) => {
  const { orderId } = req.params;
  const userId = req.session.user?.id;

  if (!userId || !mongoose.isValidObjectId(userId)) {
    console.error(`Invalid or missing user ID in session: ${userId}`);
    return res.status(401).json({ message: "Unauthorized: Invalid user session" });
  }

  console.log(`GET /chatSection/:orderId - orderId: ${orderId}, userId: ${userId}`);

  if (!mongoose.isValidObjectId(orderId)) {
    console.error(`Invalid order ID: ${orderId}`);
    return res.status(400).json({ message: "Invalid order ID" });
  }

  try {
    const order = await Order.findById(orderId).populate("product");
    if (!order) {
      console.error(`Order not found: ${orderId}`);
      return res.status(404).json({ message: "Order not found" });
    }

    if (!order.product) {
      console.error(`Product not found for order: ${orderId}`);
      return res.status(404).json({ message: "Product not found for this order" });
    }

    const sellerId = order.product.uploadedBy?.toString();
    if (!sellerId) {
      console.error(`Seller not found for product: ${order.product._id}`);
      return res.status(404).json({ message: "Seller not found for this product" });
    }

    if (order.user.toString() !== userId && sellerId !== userId) {
      console.error(`Unauthorized: userId ${userId} not part of order ${orderId}`);
      return res
        .status(403)
        .json({ message: "Unauthorized: You are not part of this order" });
    }

    const messages = await Message.find({
      order: orderId,
      $or: [
        { sender: userId, receiver: sellerId },
        { sender: sellerId, receiver: userId },
      ],
    })
      .populate("sender", "name")
      .populate("receiver", "name")
      .sort({ createdAt: 1 });

    console.log(`Fetched ${messages.length} messages for order ${orderId}`);

    res.status(200).json({ messages, product: order.product });
  } catch (err) {
    console.error(`Error fetching messages for order ${orderId}: ${err.message}`);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST a new message for a specific order
chatSection.post("/:orderId", isAuthenticated, async (req, res) => {
  const { orderId } = req.params;
  const { content } = req.body;
  const userId = req.session.user?.id;

  if (!userId || !mongoose.isValidObjectId(userId)) {
    console.error(`Invalid or missing user ID in session: ${userId}`);
    return res.status(401).json({ message: "Unauthorized: Invalid user session" });
  }

  console.log(
    `POST /chatSection/:orderId - orderId: ${orderId}, userId: ${userId}, content: ${content}`
  );

  if (!mongoose.isValidObjectId(orderId)) {
    console.error(`Invalid order ID: ${orderId}`);
    return res.status(400).json({ message: "Invalid order ID" });
  }

  if (!content || !content.trim()) {
    console.error("Message content is empty");
    return res.status(400).json({ message: "Message content is required" });
  }

  try {
    const order = await Order.findById(orderId).populate("product");
    if (!order) {
      console.error(`Order not found: ${orderId}`);
      return res.status(404).json({ message: "Order not found" });
    }

    if (!order.product) {
      console.error(`Product not found for order: ${orderId}`);
      return res.status(404).json({ message: "Product not found for this order" });
    }

    const sellerId = order.product.uploadedBy?.toString();
    if (!sellerId) {
      console.error(`Seller not found for product: ${order.product._id}`);
      return res.status(404).json({ message: "Seller not found for this product" });
    }

    if (order.user.toString() !== userId && sellerId !== userId) {
      console.error(`Unauthorized: userId ${userId} not part of order ${orderId}`);
      return res
        .status(403)
        .json({ message: "Unauthorized: You are not part of this order" });
    }

    const receiverId =
      userId === order.user.toString() ? sellerId : order.user.toString();
    console.log(`Receiver ID: ${receiverId}`);

    if (!mongoose.isValidObjectId(receiverId)) {
      console.error(`Invalid receiver ID: ${receiverId}`);
      return res.status(400).json({ message: "Invalid receiver ID" });
    }

    const message = new Message({
      content: content.trim(),
      sender: userId,
      receiver: receiverId,
      order: orderId,
    });

    await message.save();
    console.log(`Message saved: ${message._id}`);

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name")
      .populate("receiver", "name");

    if (!populatedMessage) {
      console.error(`Failed to populate message: ${message._id}`);
      return res.status(500).json({ message: "Failed to retrieve message" });
    }

    res.status(201).json({ message: populatedMessage });
  } catch (err) {
    console.error(`Error saving message for order ${orderId}: ${err.message}`);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = chatSection;