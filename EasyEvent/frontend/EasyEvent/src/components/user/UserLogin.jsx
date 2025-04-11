import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/api/login", {
        email,
        password,
      });
      toast.success(response.data.message);
      const token = response.data.token;
      localStorage.setItem("access_token", token);

      // Retrieve stored redirect URL (if any)
      const redirectUrl = localStorage.getItem("redirect_after_login");
      console.log("Redirect URL retrieved:", redirectUrl);
      localStorage.removeItem("redirect_after_login");

      if (redirectUrl && redirectUrl !== "/login") {
        navigate(redirectUrl, { replace: true });
      } else if (response.data.role === "admin") {
        navigate("/admin-dashboard", { replace: true });
      } else if (response.data.role === "venueOwner") {
        localStorage.setItem("venueId", response.data.venueId);
        navigate("/venue-owner-dashboard", { replace: true });
      } else {
        navigate("/user-dashboard", { replace: true });
      }
    } catch (error) {
      toast.error("Login failed!");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Section */}
      <div className="w-1/2 bg-orange-500 flex flex-col justify-center items-center p-10">
        <h1 className="text-5xl font-bold text-white">
          Welcome, <span className="text-yellow-300">Back!</span>
        </h1>
        <p className="mt-4 text-lg text-white text-center px-6">
          Seamless Event Planning Starts Here – Find, Book, and Celebrate with Confidence!
        </p>
      </div>

      {/* Right Section */}
      <div className="w-1/2 bg-white flex flex-col justify-center items-center p-10">
        <h2 className="text-3xl font-bold text-orange-500 mb-4">Login</h2>
        <p className="text-gray-600 mb-8">
          Enter your Credentials to access your account
        </p>

        <form className="w-3/4" onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="email"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4 relative">
            <label htmlFor="password" className="block text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                id="password"
                placeholder="password"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? (
                  <EyeIcon className="w-6 h-6 text-gray-500" />
                ) : (
                  <EyeSlashIcon className="w-6 h-6 text-gray-500" />
                )}
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center mb-6">
            <Link to="/forgotpassword" className="text-blue-500 hover:underline ml-auto">
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition duration-200"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-lg font-medium">
            Don't have an account?
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <Link
              to="/user-signup"
              className="border border-orange-600 text-black py-2 px-6 rounded-lg transition duration-200 hover:bg-orange-600 hover:text-white"
            >
              Signup as User
            </Link>
            <Link
              to="/venue-owner-signup"
              className="border border-orange-600 text-black py-2 px-6 rounded-lg transition duration-200 hover:bg-orange-600 hover:text-white"
            >
              Signup as Venue Owner
            </Link>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default UserLogin;