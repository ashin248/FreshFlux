import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/ProductSection.css";

const ProductSection = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState({}); // Track payment method for each product
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3030/productSection",
          {
            withCredentials: true,
          }
        );
        console.log("Fetched products:", response.data.products);
        setProducts(response.data.products || []);
        // Initialize payment methods with default value (e.g., "cashOnDelivery")
        const initialPaymentMethods = {};
        response.data.products.forEach((product) => {
          initialPaymentMethods[product._id] = "cashOnDelivery";
        });
        setPaymentMethods(initialPaymentMethods);
      } catch (err) {
        console.error("Error fetching products:", err);
        const status = err.response?.status;
        if (status === 401) {
          navigate("/login");
        } else {
          setError(
            err.response?.data?.message ||
              "Failed to load products. Please try again."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [navigate]);

  const handlePaymentMethodChange = (productId, method) => {
    setPaymentMethods((prev) => ({
      ...prev,
      [productId]: method,
    }));
  };

  const handleOrder = async (productId) => {
    const paymentMethod = paymentMethods[productId];
    if (!paymentMethod) {
      setError("Please select a payment method.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3030/orderDetails/order",
        { productId, paymentMethod },
        { withCredentials: true }
      );
      const orderId = response.data.orderId;
      if (!orderId || !/^[0-9a-fA-F]{24}$/.test(orderId)) {
        throw new Error("Invalid order ID returned from server");
      }
      console.log(
        `Order created for product ${productId}: orderId=${orderId}, paymentMethod=${paymentMethod}`
      );
      navigate(`/orderDetails/${orderId}`);
    } catch (err) {
      console.error("Order error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to place order. Please try again."
      );
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  return (
    <div className="product-section-container">
      <h2 className="product-section-title">Products</h2>
      <button
        onClick={() => navigate("/orderDetails")}
        className="btn btn-view-orders"
      >
        View All Orders
      </button>
      {error && <p className="error-message">{error}</p>}
      {products.length === 0 ? (
        <p className="no-products">No products available.</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product._id} className="product-card">
              <img
                src={
                  product.image
                    ? `http://localhost:3030/Uploads/${product.image}`
                    : "https://via.placeholder.com/150?text=No+Image"
                }
                alt={product.name}
                className="product-image"
              />
              <h3 className="product-name">{product.name}</h3>
              <p className="product-price">${product.price.toFixed(2)}</p>
              <div className="payment-method-section">
                <p className="payment-method-title">Select Payment Method:</p>
                <label className="payment-method-option">
                  <input
                    type="radio"
                    name={`paymentMethod-${product._id}`}
                    value="cashOnDelivery"
                    checked={paymentMethods[product._id] === "cashOnDelivery"}
                    onChange={() =>
                      handlePaymentMethodChange(product._id, "cashOnDelivery")
                    }
                  />
                  Cash on Delivery
                </label>
                <label className="payment-method-option">
                  <input
                    type="radio"
                    name={`paymentMethod-${product._id}`}
                    value="onlinePayment"
                    checked={paymentMethods[product._id] === "onlinePayment"}
                    onChange={() =>
                      handlePaymentMethodChange(product._id, "onlinePayment")
                    }
                  />
                  Online Payment
                </label>
              </div>
              <button
                onClick={() => handleOrder(product._id)}
                className="btn btn-order"
              >
                Order
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductSection;
