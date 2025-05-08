import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../css/orderdetails.css";

const OrderDetails = () => {
  const [orders, setOrders] = useState([]);
  const [singleOrder, setSingleOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { orderId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (orderId) {
          if (!/^[0-9a-fA-F]{24}$/.test(orderId)) {
            throw new Error("Invalid order ID format");
          }
          const response = await axios.get(
            `http://localhost:3030/orderDetails/${orderId}`,
            {
              withCredentials: true,
            }
          );
          console.log("Fetched single order:", response.data.order);
          if (!response.data.order) {
            throw new Error("Order not found");
          }
          setSingleOrder(response.data.order);
        } else {
          const response = await axios.get(
            "http://localhost:3030/orderDetails",
            {
              withCredentials: true,
            }
          );
          console.log("Fetched orders:", response.data.orders);
          setOrders(response.data.orders || []);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        const status = err.response?.status;
        if (status === 401) {
          navigate("/login");
        } else if (status === 400) {
          setError(`Invalid order ID: ${orderId}`);
        } else if (status === 404) {
          setError(err.response?.data?.message || "Order not found");
        } else {
          setError(
            err.response?.data?.message ||
              "Failed to load orders. Please try again later."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId, navigate]);

  const handleCancelOrder = async (orderId) => {
    console.log(`Cancel button clicked for orderId: ${orderId}`);
    try {
      const response = await axios.post(
        `http://localhost:3030/orderDetails/cancel/${orderId}`,
        {},
        { withCredentials: true }
      );
      console.log("Cancel response:", response.data);
      if (singleOrder && singleOrder._id === orderId) {
        setSingleOrder((prev) => ({ ...prev, status: "canceled" }));
      } else {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: "canceled" } : order
          )
        );
      }
      setError("Order canceled successfully.");
    } catch (err) {
      console.error("Cancel order error:", err);
      const status = err.response?.status;
      let errorMessage = "Failed to cancel order. Please try again.";
      if (status === 400)
        errorMessage = err.response?.data?.message || "Invalid order ID.";
      if (status === 404) errorMessage = "Order not found.";
      if (status === 401) errorMessage = "Unauthorized. Please log in again.";
      setError(errorMessage);
    }
  };

  const handleReturnOrder = async (orderId) => {
    console.log(`Return button clicked for orderId: ${orderId}`);
    try {
      const response = await axios.post(
        `http://localhost:3030/orderDetails/return/${orderId}`,
        {},
        { withCredentials: true }
      );
      console.log("Return response:", response.data);
      if (singleOrder && singleOrder._id === orderId) {
        setSingleOrder((prev) => ({ ...prev, returnStatus: "requested" }));
      } else {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId
              ? { ...order, returnStatus: "requested" }
              : order
          )
        );
      }
      setError("Return request submitted successfully.");
    } catch (err) {
      console.error("Return order error:", err);
      const status = err.response?.status;
      let errorMessage = "Failed to submit return request. Please try again.";
      if (status === 400)
        errorMessage = err.response?.data?.message || "Invalid order ID.";
      if (status === 404) errorMessage = "Order not found.";
      if (status === 401) errorMessage = "Unauthorized. Please log in again.";
      setError(errorMessage);
    }
  };

  const handleChatWithSeller = (orderId) => {
    console.log(`Chat button clicked for orderId: ${orderId}`);
    if (!/^[0-9a-fA-F]{24}$/.test(orderId)) {
      console.error(`Invalid order ID for chat: ${orderId}`);
      setError("Invalid order ID. Cannot open chat.");
      return;
    }
    navigate(`/chatSection/${orderId}`);
  };

  const getProgressSteps = (order) => {
    return [
      {
        label: "Ordered",
        completed: order.status === "ordered" || order.status === "canceled",
      },
      {
        label: "Packed",
        completed:
          order.packingDate && new Date() >= new Date(order.packingDate),
      },
      {
        label: "Delivered",
        completed:
          order.deliveryDate && new Date() >= new Date(order.deliveryDate),
      },
    ];
  };

  if (loading) {
    return (
      <div className="order-details-container">
        <div className="loading">
          <svg
            className="spinner"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="spinner-circle"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="spinner-path"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-details-container">
      <h2 className="order-details-title">Order Details</h2>
      {error && (
        <p
          className={`message ${
            error.includes("successfully") ? "success-message" : "error-message"
          }`}
        >
          {error}
        </p>
      )}
      {singleOrder ? (
        <div className="order-details-card">
          <div className="order-details-content">
            <div className="product-info">
              <img
                src={
                  singleOrder.product?.image
                    ? `http://localhost:3030/Uploads/${singleOrder.product.image}`
                    : "https://via.placeholder.com/150?text=No+Image"
                }
                alt={singleOrder.product?.name || "Unknown"}
                className="product-image"
              />
              <div className="product-details">
                <p>
                  <strong>Product Name:</strong>{" "}
                  {singleOrder.product?.name || "N/A"}
                </p>
                <p>
                  <strong>Price:</strong> $
                  {singleOrder.product?.price?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
            <div className="order-info">
              <p>
                <strong>Status:</strong>{" "}
                {singleOrder.status.charAt(0).toUpperCase() +
                  singleOrder.status.slice(1)}
              </p>
              <p>
                <strong>Status:</strong>
                Regardless of the payment method, pay after receiving the product.
              </p>
              <p>
                <strong>Ordered By:</strong> {singleOrder.user?.name || "N/A"}
              </p>
              <p>
                <strong>Packing Date:</strong>{" "}
                {new Date(singleOrder.packingDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p>
                <strong>Delivery Date:</strong>{" "}
                {new Date(singleOrder.deliveryDate).toLocaleDateString(
                  "en-GB",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                )}
              </p>
              <p>
                <strong>Return Status:</strong>{" "}
                {singleOrder.returnStatus.charAt(0).toUpperCase() +
                  singleOrder.returnStatus.slice(1)}
              </p>
              <p className="delivery-note">
                <strong>Note:</strong> All orders will be delivered within three
                days.
              </p>
            </div>
            <div className="progress-tracker">
              <div
                className={`progress-line ${
                  getProgressSteps(singleOrder)[1].completed
                    ? "progress-completed"
                    : ""
                }`}
              ></div>
              {getProgressSteps(singleOrder).map((step, index) => (
                <div key={index} className="progress-step">
                  <div
                    className={`progress-circle ${
                      step.completed ? "circle-completed" : ""
                    }`}
                  >
                    {step.completed ? "✓" : index + 1}
                  </div>
                  <div className="progress-label">{step.label}</div>
                </div>
              ))}
            </div>
            <div className="action-buttons">
              {console.log(
                `singleOrder - ID: ${singleOrder._id}, Status: ${singleOrder.status}, ReturnStatus: ${singleOrder.returnStatus}`
              )}
              {singleOrder.status === "canceled" ? (
                <p className="no-actions">
                  Order is canceled. No actions available.
                </p>
              ) : (
                <>
                  <button
                    onClick={() => handleCancelOrder(singleOrder._id)}
                    className="btn btn-cancel"
                    disabled={singleOrder.status === "canceled"}
                  >
                    Cancel Order
                  </button>
                  {singleOrder.returnStatus === "none" ? (
                    <button
                      onClick={() => handleReturnOrder(singleOrder._id)}
                      className="btn btn-return"
                      disabled={singleOrder.returnStatus !== "none"}
                    >
                      Return Order
                    </button>
                  ) : (
                    <p className="no-actions">
                      Return already requested or processed.
                    </p>
                  )}
                </>
              )}
              <button
                onClick={() => handleChatWithSeller(singleOrder._id)}
                className="btn btn-chat"
              >
                Chat with Seller
              </button>
            </div>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <p className="no-orders">
          No orders found. Please place an order from the products section.
        </p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-details-card">
              <div className="order-details-content">
                <div className="product-info">
                  <img
                    src={
                      order.product?.image
                        ? `http://localhost:3030/Uploads/${order.product.image}`
                        : "https://via.placeholder.com/150?text=No+Image"
                    }
                    alt={order.product?.name || "Unknown"}
                    className="product-image"
                  />
                  <div className="product-details">
                    <p>
                      <strong>Product Name:</strong>{" "}
                      {order.product?.name || "N/A"}
                    </p>
                    <p>
                      <strong>Price:</strong> $
                      {order.product?.price?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                </div>
                <div className="order-info">
                  <p>
                    <strong>Status:</strong>{" "}
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </p>
                  <p>
                    <strong>Ordered By:</strong> {order.user?.name || "N/A"}
                  </p>
                  <p>
                    <strong>Packing Date:</strong>{" "}
                    {new Date(order.packingDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p>
                    <strong>Delivery Date:</strong>{" "}
                    {new Date(order.deliveryDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p>
                    <strong>Return Status:</strong>{" "}
                    {order.returnStatus.charAt(0).toUpperCase() +
                      order.returnStatus.slice(1)}
                  </p>
                  <p className="delivery-note">
                    <strong>Note:</strong> All orders will be delivered within
                    three days.
                  </p>
                </div>
                <div className="progress-tracker">
                  <div
                    className={`progress-line ${
                      getProgressSteps(order)[1].completed
                        ? "progress-completed"
                        : ""
                    }`}
                  ></div>
                  {getProgressSteps(order).map((step, index) => (
                    <div key={index} className="progress-step">
                      <div
                        className={`progress-circle ${
                          step.completed ? "circle-completed" : ""
                        }`}
                      >
                        {step.completed ? "✓" : index + 1}
                      </div>
                      <div className="progress-label">{step.label}</div>
                    </div>
                  ))}
                </div>
                <div className="action-buttons">
                  {console.log(
                    `Order - ID: ${order._id}, Status: ${order.status}, ReturnStatus: ${order.returnStatus}`
                  )}
                  {order.status === "canceled" ? (
                    <p className="no-actions">
                      Order is canceled. No actions available.
                    </p>
                  ) : (
                    <>
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="btn btn-cancel"
                        disabled={order.status === "canceled"}
                      >
                        Cancel Order
                      </button>
                      {order.returnStatus === "none" ? (
                        <button
                          onClick={() => handleReturnOrder(order._id)}
                          className="btn btn-return"
                          disabled={order.returnStatus !== "none"}
                        >
                          Return Order
                        </button>
                      ) : (
                        <p className="no-actions">
                          Return already requested or processed.
                        </p>
                      )}
                    </>
                  )}
                  <button
                    onClick={() => handleChatWithSeller(order._id)}
                    className="btn btn-chat"
                  >
                    Chat with Seller
                  </button>
                </div>
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
      {!singleOrder && (
        <button
          onClick={() => navigate("/orderDetails")}
          className="btn btn-view-all"
        >
          View All Orders
        </button>
      )}
    </div>
  );
};

export default OrderDetails;
