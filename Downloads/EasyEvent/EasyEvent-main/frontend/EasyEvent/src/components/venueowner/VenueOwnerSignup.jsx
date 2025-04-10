import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const VenueOwnerSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    contact_number: "",
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate password criteria: at least 8 characters, an uppercase letter, a lowercase letter, a number, and a special character.
  const validatePassword = (pwd) => {
    const strengthChecks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
    return Object.values(strengthChecks).every(Boolean);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.contact_number
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    // Validate password strength
    if (!validatePassword(formData.password)) {
      toast.error("Password does not meet requirements!");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      contact_number: formData.contact_number,
    };

    try {
      const response = await fetch(
        "http://localhost:8000/api/signupVenueOwner",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        toast.success("Signup successful!");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        const errorData = await response.json();
        toast.error(`Signup failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error during signup:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <ToastContainer />
      {/* Left Section */}
      <div className="w-1/2 bg-gradient-to-br from-orange-500 to-orange-600 text-white flex flex-col justify-center items-center p-10 shadow-lg">
        <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">
          Welcome, Venue Owners!
        </h1>
        <p className="text-lg text-center max-w-md">
          Join us to elevate your venue's visibility and streamline event
          management!
        </p>
      </div>
      {/* Right Section */}
      <div className="w-1/2 bg-white flex flex-col justify-center items-center p-10">
        <h2 className="text-3xl font-bold text-orange-600 mb-6">Signup</h2>
        <form className="w-3/4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 transition duration-300"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 transition duration-300"
                required
              />
            </div>
            <div className="relative">
              <label className="block text-gray-700 font-medium mb-1">
                Password
              </label>
              <input
                type={passwordVisible ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-12 focus:ring-2 focus:ring-orange-500 transition duration-300"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-[70%] transform -translate-y-1/2 flex items-center justify-center w-8 h-8"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? (
                  <EyeIcon className="w-5 h-5 text-gray-500" />
                ) : (
                  <EyeSlashIcon className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {formData.password && !validatePassword(formData.password) && (
                <p className="text-red-600 text-sm mt-2">
                  Password must be 8+ characters, include uppercase, lowercase,
                  number, and special character.
                </p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Contact Number
              </label>
              <input
                type="text"
                name="contact_number"
                placeholder="+1234567890"
                value={formData.contact_number}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 transition duration-300"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full mt-6 py-3 rounded-lg text-white font-medium transition-all transform hover:scale-105 ${
              isSubmitting
                ? "bg-orange-300 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            }`}
          >
            {isSubmitting ? "Signing up..." : "Signup"}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-orange-600 font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VenueOwnerSignup;
