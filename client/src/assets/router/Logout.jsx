import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/Logout.css";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3030/logout",
        {},
        { withCredentials: true }
      );
      alert(response.data.message);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout");
    }
  };

  return (
    <div className="logout-container">
      <h2 className="logout-title">Logout</h2>
      <p className="logout-message">Are you sure you want to logout?</p>
      <button onClick={handleLogout} className="btn btn-logout">
        Logout
      </button>
    </div>
  );
};

export default Logout;
