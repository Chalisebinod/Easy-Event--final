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

  // Validate contact number (exactly 10 digits)
  const validateContactNumber = (number) => {
    return /^[0-9]{10}$/.test(number);
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

    // Validate contact number
    if (!validateContactNumber(formData.contact_number)) {
      toast.error("Contact number must be exactly 10 digits!");
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

  const handleLoginAlert = () => {
    toast.info("Please sign up before logging in!");
  };

  return (
    <div className="flex min-h-screen bg-white justify-center items-center">
      <ToastContainer />
      
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Venue Owner Registration</h2>
          <p className="text-gray-600 text-sm">
            Join our platform to showcase and manage your venue
          </p>
        </div>
        
        <form className="w-full" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1 text-sm">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition duration-300"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1 text-sm">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition duration-300"
                required
              />
            </div>
            <div className="relative">
              <label className="block text-gray-700 font-medium mb-1 text-sm">
                Password
              </label>
              <div className="relative">
                <input
                  type={passwordVisible ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-orange-500 focus:outline-none transition duration-300"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? (
                    <EyeIcon className="w-5 h-5 text-gray-500" />
                  ) : (
                    <EyeSlashIcon className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>

              {formData.password && !validatePassword(formData.password) && (
                <p className="text-red-600 text-xs mt-1">
                  Password must be 8+ characters, include uppercase, lowercase,
                  number, and special character.
                </p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1 text-sm">
                Contact Number
              </label>
              <input
                type="text"
                name="contact_number"
                placeholder="1234567890"
                value={formData.contact_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition duration-300"
                required
              />
              {!validateContactNumber(formData.contact_number) &&
                formData.contact_number && (
                  <p className="text-red-600 text-xs mt-1">
                    Contact number must be exactly 10 digits.
                  </p>
                )}
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full mt-6 py-2 rounded-lg text-white font-medium transition duration-200 ${
              isSubmitting
                ? "bg-orange-300 cursor-not-allowed"
                : "bg-orange-600 hover:bg-orange-700"
            }`}
          >
            {isSubmitting ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            onClick={handleLoginAlert}
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