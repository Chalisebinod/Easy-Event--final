import React, { useEffect, useState, forwardRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Dashboard as DashboardIcon,
  RequestQuote as RequestQuoteIcon,
  Event as EventIcon,
  Payments as PaymentsIcon,
  AccountBalance as AccountBalanceIcon,
  AccountCircle as ProfileIcon,
  Store as StoreIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Image as GalleryIcon,
  VerifiedUser as KycIcon,
} from "@mui/icons-material";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import RateReviewIcon from "@mui/icons-material/RateReview";
import Slide from "@mui/material/Slide";

// Logout Dialog Transition
const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const VenueSidebar = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationCount, setNotificationCount] = useState(0);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [userId, setUserId] = useState(null);

  // Fetch venue owner profile to get the user ID
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        const response = await axios.get(
          "http://localhost:8000/api/venueOwner/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUserId(response.data._id);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get(
          "http://localhost:8000/api/notification/getUnreads",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotificationCount(response.data.count || 0);
      } catch (error) {
        console.error("Error fetching notification count:", error);
      }
    };

    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const openLogoutDialog = () => setLogoutDialogOpen(true);
  const closeLogoutDialog = () => setLogoutDialogOpen(false);

  // Menu items configuration
  const menuItems = [
    { path: "/venue-owner-dashboard", icon: <DashboardIcon className="w-5 h-5" />, label: "Dashboard" },
    { path: "/user-request", icon: <RequestQuoteIcon className="w-5 h-5" />, label: "Request" },
    { path: "/bookings-owner", icon: <BookOnlineIcon className="w-5 h-5" />, label: "Bookings" },
    { path: "/foodManagement", icon: <AccountBalanceIcon className="w-5 h-5" />, label: "Food Management" },
    { path: "/halls", icon: <StoreIcon className="w-5 h-5" />, label: "Halls" },
    { 
      path: "/notification", 
      icon: (
        <div className="relative">
          <NotificationsIcon className="w-5 h-5" />
          {notificationCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </div>
      ), 
      label: "Notifications" 
    },
    { path: "/transaction", icon: <PaymentsIcon className="w-5 h-5" />, label: "Payments" },
    { path: "/agreement", icon: <AccountBalanceIcon className="w-5 h-5" />, label: "Agreement" },
    { path: "/chat", icon: <EventIcon className="w-5 h-5" />, label: "Chat" },
    { path: `/venueOwner-profile/${userId}`, icon: <ProfileIcon className="w-5 h-5" />, label: "Profile" },
    { path: "/venueOwnerKyc", icon: <KycIcon className="w-5 h-5" />, label: "KYC" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 fixed h-full">
  <div className="h-full flex flex-col bg-green-900 shadow-xl">
    {/* Logo/Brand */}
    <div className="p-6 flex justify-center">
      <div className="bg-white bg-opacity-10 px-4 py-3 rounded-lg">
        <h1 className="text-xl font-bold tracking-wide text-white">
          <span className="text-yellow-400">Easy</span>Event
        </h1>
      </div>
    </div>

    {/* Navigation Links */}
    <div className="px-4 py-2 flex-grow overflow-y-auto">
      <ul className="space-y-1">
        {menuItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                location.pathname === item.path
                  ? "bg-green-700 text-white font-medium shadow-md"
                  : "text-green-100 hover:bg-green-800"
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>

    {/* Logout Button */}
    <div className="p-4 border-t border-green-800">
      <button
        onClick={openLogoutDialog}
        className="w-full flex items-center px-4 py-3 text-green-100 hover:bg-green-800 rounded-lg transition-colors duration-200"
      >
        <LogoutIcon className="w-5 h-5 mr-3" />
        <span>Logout</span>
      </button>
    </div>
  </div>
</div>

      {/* Main Content */}
      <div className="ml-64 flex-grow p-6">
        {children}
      </div>

      {/* Logout Dialog */}
      {logoutDialogOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Confirm Logout
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to log out?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleLogout}
                >
                  Logout
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeLogoutDialog}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VenueSidebar;