import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaBookOpen,
  FaBuilding,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronUp,
  FaUserShield,
} from "react-icons/fa";

const Sidebar = () => {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showKycDropdown, setShowKycDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => setShowLogoutDialog(true);
  const confirmLogout = () => {
    localStorage.removeItem("access_token");
    setShowLogoutDialog(false);
    navigate("/login");
  };
  const cancelLogout = () => setShowLogoutDialog(false);
  const toggleKycDropdown = () => setShowKycDropdown((prev) => !prev);

  // Navigation item styling similar to the screenshot
  const baseLinkClasses = 
    "flex items-center py-4 px-6 w-full transition-colors duration-200 hover:bg-gray-800";
  const inactiveLinkClasses = "text-gray-300";
  const activeLinkClasses = "bg-gray-800 text-white";

  // Helper function for navigation links
  const renderNavLink = (to, icon, label) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
      }
    >
      {icon}
      <span className="ml-4 font-medium">{label}</span>
    </NavLink>
  );

  return (
    <aside className="w-64 bg-[#121A29] text-gray-300 h-screen fixed left-0 top-0 z-10">
      {/* Logo Area */}
      <div className="py-6 px-6 border-b border-gray-800">
        <h1 className="text-3xl font-bold text-white">
          EasyEvent
        </h1>
      </div>

      {/* Navigation Menu */}
      <nav className="flex flex-col h-[calc(100%-134px)]">
        <ul className="w-full">
          {/* Dashboard */}
          <li>
            {renderNavLink(
              "/admin-dashboard",
              <FaTachometerAlt className="text-lg" />,
              "Dashboard"
            )}
          </li>

          {/* KYC Request with Dropdown */}
          <li>
            <button
              onClick={toggleKycDropdown}
              className={`${baseLinkClasses} justify-between ${
                showKycDropdown ? activeLinkClasses : inactiveLinkClasses
              }`}
            >
              <div className="flex items-center">
                <FaBookOpen className="text-lg" />
                <span className="ml-4 font-medium">KYC Request</span>
              </div>
              <span>
                {showKycDropdown ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </button>
            
            {showKycDropdown && (
              <ul className="bg-gray-900">
                <li>
                  <NavLink
                    to="/kyc-request"
                    className={({ isActive }) =>
                      `block py-3 pl-16 pr-6 transition-colors duration-200 ${
                        isActive 
                          ? "bg-gray-800 text-white" 
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      }`
                    }
                  >
                    All Requests
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/kyc-request?status=rejected"
                    className={({ isActive }) =>
                      `block py-3 pl-16 pr-6 transition-colors duration-200 ${
                        isActive 
                          ? "bg-gray-800 text-white" 
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      }`
                    }
                  >
                    Rejected
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/kyc-request?status=pending"
                    className={({ isActive }) =>
                      `block py-3 pl-16 pr-6 transition-colors duration-200 ${
                        isActive 
                          ? "bg-gray-800 text-white" 
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      }`
                    }
                  >
                    Pending
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/kyc-request?status=approved"
                    className={({ isActive }) =>
                      `block py-3 pl-16 pr-6 transition-colors duration-200 ${
                        isActive 
                          ? "bg-gray-800 text-white" 
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      }`
                    }
                  >
                    Approved
                  </NavLink>
                </li>
              </ul>
            )}
          </li>

          {/* Users */}
          <li>
            {renderNavLink(
              "/all-user",
              <FaUsers className="text-lg" />,
              "Users"
            )}
          </li>

          {/* Venue Owner */}
          <li>
            {renderNavLink(
              "/all-venueUser",
              <FaBuilding className="text-lg" />,
              "Venue Owners"
            )}
          </li>

          {/* Venues */}
          <li>
            {renderNavLink(
              "/all-venue",
              <FaBuilding className="text-lg" />,
              "Venues"
            )}
          </li>

          {/* Admin */}
          {/* <li>
            {renderNavLink(
              "/all-admin",
              <FaUserShield className="text-lg" />,
              "Admin"
            )}
          </li> */}
        </ul>

        {/* Push Logout to bottom */}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center py-4 px-6 w-full text-gray-300 hover:bg-gray-800 transition-colors duration-200"
          >
            <FaSignOutAlt className="text-lg" />
            <span className="ml-4 font-medium">Logout</span>
          </button>
        </div>
      </nav>

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Confirm Logout
            </h2>
            <p className="text-gray-300">
              Are you sure you want to log out?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;