import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="content-wrapper">
        <h1 className="title">Welcome to FreshFlux</h1>
        <p className="description">
          FreshFlux is a revolutionary platform designed for new entrepreneurs
          to sell their products directly to customers, bypassing traditional
          intermediaries. Whether you're a small business owner, a local
          artisan, or a startup innovator, FreshFlux empowers you to showcase
          your unique products to a global audience. With an easy-to-use
          interface, secure transactions, and tools to manage your inventory and
          orders, FreshFlux makes it simple to start selling and grow your
          business. Join our community of passionate sellers and take control of
          your entrepreneurial journey today!
        </p>
        <div className="button-group">
          <button
            onClick={() => navigate("/register")}
            className="btn btn-primary"
          >
            Register
          </button>
          <button
            onClick={() => navigate("/login")}
            className="btn btn-secondary"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
