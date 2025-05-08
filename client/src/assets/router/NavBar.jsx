import React from "react";
import { NavLink } from "react-router-dom";
import { Outlet } from "react-router-dom";
import "../css/navBar.css";

const NavBar = () => {
  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <NavLink to="/" className="navbar-logo">
            <img
              src="/image/logo.png"
              alt="Logo"
              style={{ width: "150px", height: "100px" }}
            />
          </NavLink>
          <ul className="navbar-links">
            <li>
              <NavLink
                to="/companyUpload"
                className={({ isActive }) =>
                  isActive ? "navbar-link active" : "navbar-link"
                }
              >
                Company Upload
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/profileEdit"
                className={({ isActive }) =>
                  isActive ? "navbar-link active" : "navbar-link"
                }
              >
                Profile Edit
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/productSection"
                className={({ isActive }) =>
                  isActive ? "navbar-link active" : "navbar-link"
                }
              >
                Product Section
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/orderDetails"
                className={({ isActive }) =>
                  isActive ? "navbar-link active" : "navbar-link"
                }
              >
                Order Details
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/orderHistory"
                className={({ isActive }) =>
                  isActive ? "navbar-link active" : "navbar-link"
                }
              >
                Order History
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/logout"
                className={({ isActive }) =>
                  isActive ? "navbar-link active" : "navbar-link"
                }
              >
                Logout
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/userUploadSection"
                className={({ isActive }) =>
                  isActive ? "navbar-link active" : "navbar-link"
                }
              >
                userUploadSection
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
      <Outlet />
    </>
  );
};

export default NavBar;
