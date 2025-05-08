import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import Home from "./assets/router/Home";
import Register from "./assets/router/Register";
import Login from "./assets/router/Login";
import Navbar from "./assets/router/NavBar";
import ProfileEdit from "./assets/router/ProfileEdit";
import ProductSection from "./assets/router/ProductSection";
import OrderDetails from "./assets/router/Orderdetails";
import OrderHistory from "./assets/router/OderHistory";
import CompanyUpload from "./assets/router/ComPanyupload";
import ChatSection from "./assets/router/ChatSection";
import Logout from "./assets/router/Logout";
import UserUploadSection from "./assets/router/UserUploadSection";


// ProtectedRoute component to restrict access to authenticated users
const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication...");
        await axios.get("http://localhost:3030/auth/check-auth", {
          withCredentials: true,
        });
        setIsAuthenticated(true);
        console.log("User is authenticated");
      } catch (err) {
        console.error("Authentication check failed:", err);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <p className="text-gray-700 text-lg">Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Navbar />}>
            <Route path="/logout" element={<Logout />} />
            <Route path="/companyUpload" element={<CompanyUpload />} />
            <Route path="/profileEdit" element={<ProfileEdit />} />
            <Route path="/productSection" element={<ProductSection />} />
            <Route path="/orderDetails" element={<OrderDetails />} />
            <Route path="/orderDetails/:orderId" element={<OrderDetails />} />
            <Route path="/chatSection/:orderId" element={<ChatSection />} />
            <Route path="/orderHistory" element={<OrderHistory />} />
            <Route path="/userUploadSection" element={<UserUploadSection />} />
            {/* <Route path="/userUploadSection/:orderId" element={<UserUploadSection />} /> */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

const NotFound = () => {
  return (
    <div className="not-found" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f3f4f6', color: '#1f2937' }}>
      <h2 style={{ fontSize: '2.25rem', fontWeight: '600', marginBottom: '1rem' }}>404 - Page Not Found</h2>
      <p style={{ fontSize: '1rem', color: '#6b7280' }}>The page you're looking for doesn't exist.</p>
      <a href="/productSection" style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: '#4f46e5', color: 'white', borderRadius: '0.5rem', textDecoration: 'none', transition: 'background-color 0.3s' }}>
        Back to Products
      </a>
    </div>
  );
};

export default App;
