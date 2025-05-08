const express = require("express");
const mongoose = require("mongoose");
const Product = require("../schema/Prodect");
const Order = require("../schema/Order");
const Message = require("../schema/chatSchema");
const { isAuthenticated } = require("../middleware/auth");

const userUploadSection = express.Router();

// GET user-uploaded products, their orders, and associated chat messages
userUploadSection.get("/", isAuthenticated, async (req, res) => {
  const userId = req.session.user?.id;

  if (!userId || !mongoose.isValidObjectId(userId)) {
    console.error(`Invalid or missing user ID in session: ${userId}`);
    return res.status(401).json({ message: "Unauthorized: Invalid user session" });
  }

  console.log(`GET /userUploadSection - userId: ${userId}`);

  try {
    // Fetch products uploaded by the user
    const products = await Product.find({ uploadedBy: userId }).populate(
      "uploadedBy",
      "name"
    );
    console.log(`Fetched ${products.length} products for user ${userId}`);

    // Prepare response with products, orders, and messages
    const responseData = [];

    for (const product of products) {
      if (!product._id) {
        console.warn(`Product missing _id: ${JSON.stringify(product)}`);
        continue;
      }

      // Fetch orders for this product
      const orders = await Order.find({ product: product._id })
        .populate("product", "name price image")
        .populate("user", "name");
      const validOrders = orders.filter(
        (order) => order.product && order.user && order.user._id
      );
      console.log(
        `Fetched ${validOrders.length} valid orders for product ${product._id}`
      );

      // Fetch messages for each order
      const ordersWithMessages = await Promise.all(
        validOrders.map(async (order) => {
          try {
            const messages = await Message.find({
              order: order._id,
              $or: [
                { sender: userId, receiver: order.user._id },
                { sender: order.user._id, receiver: userId },
              ],
            })
              .populate("sender", "name")
              .populate("receiver", "name")
              .sort({ createdAt: 1 });

            console.log(
              `Fetched ${messages.length} messages for order ${order._id}`
            );

            return {
              ...order.toObject(),
              messages,
            };
          } catch (err) {
            console.error(
              `Error fetching messages for order ${order._id}: ${err.message}`
            );
            return { ...order.toObject(), messages: [] };
          }
        })
      );

      responseData.push({
        product: product.toObject(),
        orders: ordersWithMessages,
      });
    }

    console.log(`Returning ${responseData.length} products with orders and messages`);
    res.status(200).json({ data: responseData });
  } catch (err) {
    console.error(`Error fetching user upload section data: ${err.message}`);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST a new message for a specific order
userUploadSection.post("/:orderId/message", isAuthenticated, async (req, res) => {
  const { orderId } = req.params;
  const { content } = req.body;
  const userId = req.session.user?.id;

  if (!userId || !mongoose.isValidObjectId(userId)) {
    console.error(`Invalid or missing user ID in session: ${userId}`);
    return res.status(401).json({ message: "Unauthorized: Invalid user session" });
  }

  console.log(
    `POST /userUploadSection/:orderId/message - orderId: ${orderId}, userId: ${userId}, content: ${content}`
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
      return res
        .status(404)
        .json({ message: "Product not found for this order" });
    }

    const sellerId = order.product.uploadedBy?.toString();
    if (!sellerId) {
      console.error(`Seller not found for product: ${order.product._id}`);
      return res
        .status(404)
        .json({ message: "Seller not found for this product" });
    }

    if (order.user.toString() !== userId && sellerId !== userId) {
      console.error(
        `Unauthorized: userId ${userId} not part of order ${orderId}`
      );
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
    console.error(`Error saving message: ${err.message}`);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = userUploadSection;