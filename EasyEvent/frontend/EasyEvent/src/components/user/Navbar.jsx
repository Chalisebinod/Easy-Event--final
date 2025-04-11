import React, { useState } from "react";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-orange-600 text-white font-semibold shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <div
          className="text-3xl lg:text-4xl font-bold tracking-wide cursor-pointer hover:text-yellow-300 transition-all duration-300"
          onClick={() => navigate("/user-dashboard")}
        >
          Easy<span className="text-yellow-300">Events</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {[
            { path: "/user-dashboard", label: "Home" },
            { path: "/user-bookings", label: "My Bookings" },
            { path: "/user-chat", label: "Chat" },
            { path: "/about-us", label: "About Us" },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="text-lg font-bold hover:text-yellow-300 transition-all duration-300 px-4 py-2 border-b-2 border-transparent hover:border-yellow-300"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Icons & Mobile Menu */}
        <div className="flex items-center space-x-6">
          {/* Profile Icon */}
          <div
            className="text-3xl cursor-pointer hover:text-yellow-300 transition-all duration-300"
            onClick={() => navigate("/user-profile")}
          >
            <FaUserCircle />
          </div>

          {/* Mobile Menu Toggle */}
          <div
            className="md:hidden text-3xl cursor-pointer hover:text-yellow-300 transition-all duration-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-orange-600 py-4 shadow-md">
          <nav className="flex flex-col space-y-3 text-center">
            {[
              { path: "/user-dashboard", label: "Home" },
              { path: "/user-bookings", label: "My Bookings" },
              { path: "/user-chat", label: "Chat" },
              { path: "/about-us", label: "About Us" },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-lg font-bold text-white hover:text-yellow-300 transition-all duration-300 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;