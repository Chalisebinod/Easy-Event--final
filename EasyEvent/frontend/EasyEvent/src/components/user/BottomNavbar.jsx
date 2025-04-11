import React from "react";
import { useNavigate } from "react-router-dom";

const BottomNavbar = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4 md:px-8">
        {/* Contact Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold mb-2">Contact Us</h3>
            <p>
              Email:{" "}
              <a
                href="mailto:chalisebinod40@gmail.com"
                className="text-orange-400 hover:underline"
              >
                chalisebinod40@gmail.com
              </a>
            </p>
            <p>
              Phone:{" "}
              <a
                href="tel:+9779863335795"
                className="text-orange-400 hover:underline"
              >
                +977-9863335795
              </a>
            </p>
            <p>Address: Kathmandu, Nepal</p>
          </div>

          {/* Become a Venue Owner Section */}
          <div className="mt-6 md:mt-0">
            <h3 className="text-xl font-bold mb-2">Become a Venue Owner</h3>
            <p>List your venue and reach more customers.</p>
            <button
              onClick={() => navigate("/venue-owner-signup")}
              className="mt-3 px-6 py-2 bg-orange-600 text-white text-sm font-medium rounded-full shadow-lg hover:bg-orange-700 transition duration-300"
            >
              Sign Up Now
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center space-x-6">
          <button
            onClick={() => navigate("/about")}
            className="text-sm text-gray-300 hover:text-orange-400"
          >
            About Us
          </button>
          <button
            onClick={() => navigate("/privacy")}
            className="text-sm text-gray-300 hover:text-orange-400"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => navigate("/terms")}
            className="text-sm text-gray-300 hover:text-orange-400"
          >
            Terms of Service
          </button>
          <button
            onClick={() => navigate("/faq")}
            className="text-sm text-gray-300 hover:text-orange-400"
          >
            FAQ
          </button>
        </div>

        {/* Copyright Section */}
        <div className="mt-6 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} EasyEvents. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default BottomNavbar;
