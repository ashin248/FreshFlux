import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/UserUploadSection.css";

const UserUploadSection = () => {
  const [data, setData] = useState([]);
  const [newMessages, setNewMessages] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user-uploaded products and orders
  const fetchData = useCallback(async () => {
    try {
      console.log("Fetching data from /userUploadSection");
      const response = await axios.get(
        "http://localhost:3030/userUploadSection",
        {
          withCredentials: true,
        }
      );
      console.log("Fetched user upload section data:", response.data.data);

      // Fetch messages for each order
      const updatedData = await Promise.all(
        response.data.data.map(async (item) => {
          const ordersWithMessages = await Promise.all(
            item.orders.map(async (order) => {
              try {
                const messageResponse = await axios.get(
                  `http://localhost:3030/chatSection/${order._id}`,
                  { withCredentials: true }
                );
                console.log(
                  `Fetched messages for order ${order._id}:`,
                  messageResponse.data.messages
                );
                return {
                  ...order,
                  messages: messageResponse.data.messages || [],
                };
              } catch (err) {
                console.error(
                  `Error fetching messages for order ${order._id}:`,
                  err.message
                );
                return { ...order, messages: [] };
              }
            })
          );
          return { ...item, orders: ordersWithMessages };
        })
      );

      setData(updatedData || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      const status = err.response?.status;
      const message =
        err.response?.data?.message || "Failed to load data. Please try again.";
      setError(`${message} (Status: ${status || "Unknown"})`);
      if (status === 401) {
        console.log("Unauthorized, redirecting to /login");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSendMessage = async (e, orderId, productId) => {
    e.preventDefault();
    const content = newMessages[`${productId}_${orderId}`]?.trim();
    if (!content) {
      setError("Message content cannot be empty");
      return;
    }

    setLoading(true);
    setError("");
    try {
      console.log(
        `Sending message for orderId: ${orderId}, content: ${content}`
      );
      const response = await axios.post(
        `http://localhost:3030/chatSection/${orderId}`,
        { content },
        { withCredentials: true }
      );
      console.log(`Message sent: ${response.data.message._id}`);
      setData((prev) =>
        prev.map((item) =>
          item.product._id === productId
            ? {
                ...item,
                orders: item.orders.map((order) =>
                  order._id === orderId
                    ? {
                        ...order,
                        messages: [...order.messages, response.data.message],
                      }
                    : order
                ),
              }
            : item
        )
      );
      setNewMessages((prev) => ({
        ...prev,
        [`${productId}_${orderId}`]: "",
      }));
    } catch (err) {
      console.error("Error sending message:", err);
      const status = err.response?.status;
      const message = err.response?.data?.message || "Failed to send message";
      setError(`${message} (Status: ${status || "Unknown"})`);
      if (status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMessageChange = (productId, orderId, value) => {
    setNewMessages((prev) => ({
      ...prev,
      [`${productId}_${orderId}`]: value,
    }));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  return (
    <div className="user-upload-section-container">
      <h2 className="user-upload-section-title">Your Uploaded Products</h2>
      {error && <p className="error-message">{error}</p>}
      {data.length === 0 ? (
        <p className="no-products">You haven't uploaded any products yet.</p>
      ) : (
        <div className="product-list">
          {data.map((item) => (
            <div key={item.product._id} className="product-card">
              <div className="product-details">
                <img
                  src={
                    item.product.image
                      ? `http://localhost:3030/uploads/${item.product.image}`
                      : "https://via.placeholder.com/150?text=No+Image"
                  }
                  alt={item.product.name}
                  className="product-image"
                />
                <div className="product-info">
                  <h3 className="product-title">{item.product.name}</h3>
                  <p className="product-price">
                    Price: ${item.product.price.toFixed(2)}
                  </p>
                  <p className="product-description">
                    Description: {item.product.description || "No description"}
                  </p>
                </div>
              </div>
              <div className="orders-section">
                <h4 className="orders-title">Orders and Chats</h4>
                {item.orders.length > 0 ? (
                  item.orders.map((order) => (
                    <div key={order._id} className="order-item">
                      <p className="order-info">
                        Order ID: {order._id} | Status:{" "}
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </p>
                      <p className="order-info">
                        Ordered by: {order.user?.name || "N/A"}
                      </p>
                      <div className="chat-section">
                        <h5 className="chat-title">Chat for this Order</h5>
                        <div className="message-list">
                          {order.messages.length > 0 ? (
                            order.messages.map((msg, index) => (
                              <div
                                key={msg._id || index}
                                className={`message ${
                                  msg.sender._id === msg.sender._id
                                    ? "message-sent"
                                    : "message-received"
                                }`}
                              >
                                <p className="message-content">
                                  <strong>{msg.sender.name}</strong>:{" "}
                                  {msg.content}
                                </p>
                                <p className="message-meta">
                                  {new Date(msg.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="no-messages">
                              No messages for this order yet.
                            </p>
                          )}
                        </div>
                        <form
                          onSubmit={(e) =>
                            handleSendMessage(e, order._id, item.product._id)
                          }
                          className="chat-form"
                        >
                          <input
                            type="text"
                            value={
                              newMessages[`${item.product._id}_${order._id}`] ||
                              ""
                            }
                            onChange={(e) =>
                              handleMessageChange(
                                item.product._id,
                                order._id,
                                e.target.value
                              )
                            }
                            placeholder="Type your message..."
                            className="form-input"
                          />
                          <button
                            type="submit"
                            disabled={
                              loading ||
                              !newMessages[
                                `${item.product._id}_${order._id}`
                              ]?.trim()
                            }
                            className={`btn btn-send ${
                              loading ||
                              !newMessages[
                                `${item.product._id}_${order._id}`
                              ]?.trim()
                                ? "btn-disabled"
                                : ""
                            }`}
                          >
                            Send
                          </button>
                        </form>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-orders">No orders for this product yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => navigate("/productSection")}
        className="btn btn-back"
      >
        Back to Products
      </button>
    </div>
  );
};

export default UserUploadSection;
