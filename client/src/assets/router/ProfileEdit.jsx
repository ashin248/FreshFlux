import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/ProfileEdit.css";

const ProfileEdit = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    number: "",
    image: null,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:3030/profileEdit", {
          withCredentials: true,
        });
        const { name, email, number } = response.data.user;
        setFormData((prev) => ({ ...prev, name, email, number }));
      } catch (err) {
        console.error("Error fetching user:", err);
        setError(err.response?.data?.message || "Failed to load profile");
        if (err.response?.status === 401) {
          navigate("/login");
        }
      }
    };
    fetchUser();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const data = new FormData();
    if (formData.name.trim()) data.append("name", formData.name.trim());
    if (formData.email.trim()) data.append("email", formData.email.trim());
    if (formData.password.trim())
      data.append("password", formData.password.trim());
    if (formData.number.trim()) data.append("number", formData.number.trim());
    if (formData.image) data.append("image", formData.image);

    try {
      const response = await axios.put(
        "http://localhost:3030/profileEdit",
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      setSuccess(response.data.message || "Profile updated successfully!");
      setFormData((prev) => ({ ...prev, password: "", image: null }));
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:3030/logout",
        {},
        { withCredentials: true }
      );
      navigate("/login");
    } catch (err) {
      setError("Failed to logout");
    }
  };

  return (
    <div className="profile-edit-container">
      <h2 className="profile-edit-title">Edit Profile</h2>
      <div className="profile-edit-card">
        <form
          className="profile-edit-form"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              className="form-input"
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              className="form-input"
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              New Password (leave blank to keep current)
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter new password"
              value={formData.password}
              className="form-input"
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="number" className="form-label">
              Phone Number
            </label>
            <input
              id="number"
              type="text"
              name="number"
              placeholder="Enter your phone number"
              value={formData.number}
              className="form-input"
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="image" className="form-label">
              Profile Image
            </label>
            <input
              id="image"
              type="file"
              name="image"
              accept="image/*"
              className="form-input file-input"
              onChange={handleChange}
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`btn btn-submit ${loading ? "btn-disabled" : ""}`}
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
        <button onClick={handleLogout} className="btn btn-logout">
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileEdit;
