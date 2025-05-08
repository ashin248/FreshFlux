import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/OderHistory.css";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:3030/orderDetails", {
          withCredentials: true,
        });
        console.log("Fetched orders:", response.data.orders);
        setOrders(response.data.orders);
      } catch (err) {
        console.error("Fetch orders error:", err);
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          setError("Failed to load order history");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [navigate]);

  if (loading) {
    return <div className="loading-text">Loading...</div>;
  }

  return (
    <div className="order-history-container">
      <h2 className="order-history-title">Order History</h2>
      {error && <p className="error-message">{error}</p>}
      {orders.length === 0 ? (
        <p className="no-orders">No orders found.</p>
      ) : (
        <div className="order-table-wrapper">
          <table className="order-table">
            <thead>
              <tr className="table-header">
                <th className="table-cell">Product</th>
                <th className="table-cell">Price</th>
                <th className="table-cell">Status</th>
                <th className="table-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="table-row">
                  <td className="table-cell">
                    {order.product?.name || "Unknown Product"}
                  </td>
                  <td className="table-cell">
                    ${order.product?.price?.toFixed(2) || "N/A"}
                  </td>
                  <td className="table-cell">{order.status}</td>
                  <td className="table-cell">
                    <button
                      onClick={() => {
                        if (order._id) {
                          console.log(
                            `Navigating to orderDetails with orderId: ${order._id}`
                          );
                          navigate(`/orderDetails/${order._id}`);
                        } else {
                          setError("Invalid order ID for this order");
                        }
                      }}
                      className="btn btn-view-details"
                      disabled={!order._id}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
