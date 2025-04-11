import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, Link } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const UserSignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Validate password criteria: at least 8 characters, an uppercase letter, a lowercase letter, a number, and a special character.
  const validatePassword = (pwd) => {
    const strengthChecks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    };
    return Object.values(strengthChecks).every(Boolean);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!validatePassword(formData.password)) {
      toast.error("Password does not meet requirements!");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/signup",
        formData
      );

      if (response.status === 201) {
        toast.success("Signup successful! Please log in.");
        setFormData({ name: "", email: "", password: "" });

        // Add a delay before navigation
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen">
      <ToastContainer />
      {/* Left Section with Gradient and Pattern Overlay */}
      <div className="w-1/2 bg-gradient-to-br from-orange-500 to-red-500 flex flex-col justify-center items-center p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('/path/to/pattern.png')] bg-cover"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-bold text-white drop-shadow-lg">
            Hello, <span className="text-yellow-300">Welcome!</span>
          </h1>
          <p className="mt-4 text-lg text-white">
            Join Us Today – Simplify Your Event Planning Journey!
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-1/2 bg-white flex flex-col justify-center items-center p-10">
        <h2 className="text-3xl font-bold text-orange-500 mb-6">
          Users Signup
        </h2>

        <form className="w-3/4" onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="name" className="block text-gray-700 mb-2 font-medium">
              Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-300 shadow-sm"
              required
            />
          </div>
          <div className="mb-5">
            <label htmlFor="email" className="block text-gray-700 mb-2 font-medium">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-300 shadow-sm"
              required
            />
          </div>
          <div className="mb-5 relative">
            <label htmlFor="password" className="block text-gray-700 mb-2 font-medium">
              Password
            </label>
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-300 shadow-sm"
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
            {formData.password && !validatePassword(formData.password) && (
              <p className="text-red-600 text-sm mt-2">
                Password must be 8+ characters, include uppercase, lowercase, number, and special character.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg text-white transition duration-300 transform hover:scale-105 shadow-lg ${
              isSubmitting
                ? "bg-orange-300 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            }`}
          >
            {isSubmitting ? "Signing up..." : "Signup"}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-orange-600 font-medium hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserSignup;
