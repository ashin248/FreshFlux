import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../css/ChatSection.css";

const ChatSection = () => {
  const [messages, setMessages] = useState([]);
  const [product, setProduct] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { orderId } = useParams();

  const fetchMessages = useCallback(async () => {
    console.log(`ChatSection loaded with orderId: ${orderId}`);
    if (!/^[0-9a-fA-F]{24}$/.test(orderId)) {
      console.error(`Invalid order ID: ${orderId}`);
      setError("Invalid order ID");
      setLoading(false);
      return;
    }

    try {
      console.log(`Fetching messages for orderId: ${orderId}`);
      const response = await axios.get(
        `http://localhost:禁止:3030/chatSection/${orderId}`,
        {
          withCredentials: true,
        }
      );
      console.log(`Messages fetched: ${response.data.messages?.length || 0}`);
      setMessages(response.data.messages || []);
      setProduct(response.data.product || null);
      setError("");
    } catch (err) {
      console.error("Error fetching messages:", err);
      const status = err.response?.status;
      if (status === 401) {
        console.log("Unauthorized, redirecting to /login");
        navigate("/login");
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to load messages. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [orderId, navigate]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    setError("");
    try {
      console.log(
        `Sending message for orderId: ${orderId}, content: ${newMessage}`
      );
      const response = await axios.post(
        `http://localhost:3030/chatSection/${orderId}`,
        { content: newMessage },
        { withCredentials: true }
      );
      console.log(`Message sent: ${response.data.message._id}`);
      setMessages([...messages, response.data.message]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err.response?.data?.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <h2 className="chat-title">Chat about {product?.name || "Order"}</h2>
      <div className="chat-card">
        {loading && <p className="loading-text">Loading messages...</p>}
        {error && !loading && <p className="error-message">{error}</p>}
        {product && !loading && (
          <div className="product-info">
            <p className="product-name">
              <strong>Product:</strong> {product.name}
            </p>
            <p className="product-date">
              Ordered on{" "}
              {new Date(product.createdAt).toLocaleDateString("en-GB")}
            </p>
          </div>
        )}
        {!loading && (
          <div className="message-list">
            {messages.length ? (
              messages.map((msg, index) => (
                <div
                  key={msg._id || index}
                  className={`message ${
                    msg.sender._id === msg.sender._id
                      ? "message-sent"
                      : "message-received"
                  }`}
                >
                  <p className="message-content">
                    <strong>{msg.sender.name}</strong>: {msg.content}
                  </p>
                  <p className="message-time">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="no-messages">
                No messages yet. Start the conversation!
              </p>
            )}
          </div>
        )}
        {!loading && (
          <form onSubmit={handleSendMessage} className="message-form">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="message-input"
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className={`btn btn-send ${
                loading || !newMessage.trim() ? "btn-disabled" : ""
              }`}
            >
              Send
            </button>
          </form>
        )}
        <button
          onClick={() => navigate("/orderDetails")}
          className="btn btn-back"
        >
          Back to Orders
        </button>
      </div>
    </div>
  );
};

export default ChatSection;
