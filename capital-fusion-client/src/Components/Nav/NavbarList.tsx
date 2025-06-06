import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./NavbarList.css";
import { toast } from "react-toastify";
import axios from "axios";

interface NavBarProps {
  ulstyles: string;
  listyles: string;
}

const isLoggedOutUrl: string = "http://localhost:8080/api/v1/auth/is-logout";

const NavbarList: React.FC<NavBarProps> = ({ ulstyles, listyles }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  let logout: any = 0;

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      axios
        .get(isLoggedOutUrl, {
          headers: {
            Authorization: token,
          },
        })
        .then((response) => {
          console.log("Response: " + response.data);
          setIsLoggedIn(true);
        })
        .catch((error) => {
          console.log("Error: " + error);
          setIsLoggedIn(false);
        });
    } else {
      setIsLoggedIn(false);
    }
  });

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("No token found. Please login first.");
      navigate("/user-login");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/logout", {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        console.log("Removed token");
        logout = 1;
        localStorage.removeItem("token");
        toast.success("Logged out successfully!");
        setIsLoggedIn(false);
        navigate("/dashboard");
      } else {
        const errorData = await response.json();
        toast.error(`Logout failed: ${errorData.message || "Unauthorized"}`);
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Network error during logout");
    }
  };

  return (
    <ul className={`${ulstyles} mb-0`}>
      {/* Dashboard */}
      <li className={`nav-item ${listyles}`}>
        <Link to="/dashboard" className="nav-link nav-link-animated">
          Dashboard
        </Link>
      </li>

      {/* Forms Dropdown */}
      <li className={`nav-item dropdown custom-dropdown ${listyles}`}>
        <a
          className="nav-link dropdown-toggle nav-link-animated"
          href="#"
          role="button"
          data-bs-toggle="dropdown"
        >
          Forms
        </a>
        <ul className="dropdown-menu">
          <li><Link to="/transaction" className="dropdown-item">Daily Outflow</Link></li>
          <li><Link to="/transaction-filter" className="dropdown-item">Outflow Filtered</Link></li>
          <li><Link to="/asset-data-entry" className="dropdown-item">Asset Details</Link></li>
          <li><Link to="/transaction-management" className="dropdown-item">Transaction Management</Link></li>
          <li><Link to="/audit" className="dropdown-item">Transaction List</Link></li>
          <li><Link to="/financial-planning" className="dropdown-item">Financial Planning Form</Link></li>
          <li><Link to="/asset-allocation-tracking" className="dropdown-item">Asset Allocation Tracking</Link></li>
          <li><Link to="/historical-allocation-viewer" className="dropdown-item">History Allocation Viewer</Link></li>
          <li><Link to="/rebalancing-recommendations" className="dropdown-item">Rebalancing Recommendations</Link></li>
          <li><Link to="/portfolio" className="dropdown-item">Portfolio</Link></li>
          <li><Link to="/feedback" className="dropdown-item">Feedback Form</Link></li>
        </ul>
      </li>

      {/* Report Dropdown */}
      <li className={`nav-item dropdown custom-dropdown ${listyles}`}>
        <a
          className="nav-link dropdown-toggle nav-link-animated"
          href="#"
          role="button"
          data-bs-toggle="dropdown"
        >
          Report
        </a>
        <ul className="dropdown-menu">
          <li><Link to="/cashFlowReport" className="dropdown-item">Daily Outflow Report</Link></li>
          <li><Link to="/assetReport" className="dropdown-item">Asset Report</Link></li>
        </ul>
      </li>

      {/* Register or Logout */}
      <li className={`nav-item ${listyles}`}>
        <span
          onClick={() => {
            if (isLoggedIn) {
              handleLogout();
            } else {
              navigate("/user-registration");
            }
          }}
          className="custom-btn-primary"
          style={{ cursor: "pointer" }}
        >
          {isLoggedIn ? "Logout" : "Register/Login"}
        </span>
      </li>
    </ul>
  );
};

export default NavbarList;
