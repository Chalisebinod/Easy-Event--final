import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  Typography,
  Paper,
  Chip,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  FaEnvelope,
  FaUtensils,
  FaCalendarAlt,
  FaUserTie,
  FaMapMarkerAlt,
  FaBuilding,
} from "react-icons/fa";
import VenueSidebar from "./VenueSidebar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function EventDetails() {
  const { id: bookingId } = useParams();
  const location = useLocation();
  const isRequest = location.state?.isRequest ?? true;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [reason, setReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const accessToken = localStorage.getItem("access_token");
  const navigate = useNavigate();

  function getProfileImageUrl(profileImage) {
    if (!profileImage) {
      return "https://via.placeholder.com/40"; // fallback if no image
    }
    // Replace backslashes with forward slashes to ensure a valid URL
    const normalizedPath = profileImage.replace(/\\/g, "/");
    return `http://localhost:8000/${normalizedPath}`;
  }

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        let response;
        if (isRequest) {
          response = await axios.get(
            `http://localhost:8000/api/booking/requests/profile/${bookingId}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
        } else {
          response = await axios.get(
            `http://localhost:8000/api/booking/approved/details/${bookingId}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
        }

        if (response.data.booking) {
          setBooking(response.data.booking);
          console.log("usser", response.data.booking);
        } else {
          console.error("No booking details found");
          setError("Booking details not found");
        }
      } catch (error) {
        console.error("Error fetching booking details:", error);
        setError(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, accessToken, isRequest]);

  // Show an alert message if booking status is not Pending
  useEffect(() => {
    if (booking && booking.status !== "Pending") {
      setShowAlert(true);
      setAlertMessage(`Booking status updated to "${booking.status}"!`);
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [booking]);

  const handleStatusUpdate = async (status, reasonText = "") => {
    try {
      setActionLoading(true);
      const payload = { status, reason: reasonText };
      const response = await axios.patch(
        `http://localhost:8000/api/booking/requests/${bookingId}`,
        payload,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.data.booking) {
        setBooking(response.data.booking);
        toast.success(`Booking ${status.toLowerCase()} successfully!`);
        // Redirect after a short delay to show the updated status
        setTimeout(() => {
          navigate("/user-request");
        }, 2000);
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Failed to update booking status");
    } finally {
      setActionLoading(false);
      setShowModal(false);
    }
  };

  const handleActionClick = (type) => {
    setModalType(type);
    if (type === "reject") {
      setReason("");
      setShowModal(true);
    } else if (type === "approve") {
      // Approve request directly without showing modal
      handleStatusUpdate("Accepted", "Request approved by venue owner");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <VenueSidebar />
        <div className="flex-1 p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <VenueSidebar />
        <div className="flex-1 p-8">
          <div className="text-center text-red-600">
            <p>{error || "Booking not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <VenueSidebar />
      <div className="flex-1 relative">
        <ToastContainer position="top-right" />
        {/* Sticky Header */}
        <header className="sticky top-0 z-20 bg-white shadow border-b border-gray-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-extrabold text-gray-800">
              {isRequest ? "Booking Request Details" : "Booking Details"}
            </h1>
          </div>
        </header>

        {/* Toast Alert */}
        {showAlert && (
          <div className="fixed top-4 right-4 z-50">
            <div className="flex items-center p-4 border-l-4 border-green-500 bg-green-50 rounded-md shadow-lg">
              <div className="mr-3">
                <svg
                  className="h-6 w-6 text-green-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <p className="text-green-800 font-semibold">{alertMessage}</p>
                <p className="text-green-700 text-sm">
                  An email has been sent to{" "}
                  <span className="font-semibold">
                    {booking.user?.email || "the user"}
                  </span>
                  . Thank you for using EasyEvent!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="py-10 px-8 bg-gradient-to-b from-white to-gray-100 min-h-screen">
          <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-2xl border border-gray-200 transform transition duration-200 hover:scale-[1.01]">
            {/* User Info */}
            <div className="flex items-center gap-5 mb-8 border-b pb-4">
              <img
                src={getProfileImageUrl(booking.user?.profile_image)}
                alt="User Profile"
                className="w-20 h-20 rounded-full border-2 border-gray-300 shadow-sm"
              />
              <div>
                {booking.user ? (
                  <>
                    <h3 className="text-2xl font-semibold text-gray-800">
                      {booking.user.name}
                    </h3>
                    <p className="text-gray-500 text-sm flex items-center gap-2">
                      <FaEnvelope className="text-blue-500" />
                      {booking.user.email}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500">
                    User information not available.
                  </p>
                )}
              </div>
            </div>

            <Grid container spacing={6}>
              {/* Event Information */}
              <Grid item xs={12} md={6}>
                <Paper className="p-6 rounded-lg shadow-md bg-gray-50">
                  <Typography
                    variant="h5"
                    className="font-semibold text-gray-700 mb-3"
                  >
                    Event Information
                  </Typography>
                  <Divider className="mb-3" />
                  <Box className="flex items-center gap-2 mb-2">
                    <FaUserTie className="text-green-500" />
                    <Typography className="text-gray-600">
                      {booking.event_details.event_type}
                    </Typography>
                  </Box>
                  <Box className="flex items-center gap-2 mb-2">
                    <FaCalendarAlt className="text-indigo-500" />
                    <Typography className="text-gray-600">
                      {new Date(
                        booking.event_details.date
                      ).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box className="flex items-center gap-2">
                    <FaUtensils className="text-red-500" />
                    <Typography className="text-gray-600">
                      Guests: {booking.event_details.guest_count}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Venue & Hall Details */}
              <Grid item xs={12} md={6}>
                <Paper className="p-6 rounded-lg shadow-md bg-gray-50">
                  <Typography
                    variant="h5"
                    className="font-semibold text-gray-700 mb-3"
                  >
                    Venue & Hall
                  </Typography>
                  <Divider className="mb-3" />
                  <Box className="flex items-center gap-2 mb-2">
                    <FaMapMarkerAlt className="text-pink-500" />
                    <Typography className="text-gray-600">
                      {booking.venue.name} – {booking.venue.location.address},{" "}
                      {booking.venue.location.city}
                    </Typography>
                  </Box>
                  <Box className="flex items-center gap-2">
                    <FaBuilding className="text-purple-500" />
                    <Typography className="text-gray-600">
                      {booking.hall.name} (Capacity: {booking.hall.capacity})
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Pricing Details */}
              <Grid item xs={12} md={6}>
                <Paper className="p-6 rounded-lg shadow-md bg-gray-50">
                  <Typography
                    variant="h5"
                    className="font-semibold text-gray-700 mb-3"
                  >
                    Pricing Details
                  </Typography>
                  <Divider className="mb-3" />
                  <Box className="mb-2">
                    <Typography className="text-gray-600">
                      <span className="font-medium">Original per plate:</span> ₹
                      {booking.pricing.original_per_plate_price}
                    </Typography>
                  </Box>
                  <Box className="mb-2">
                    <Typography className="text-gray-600">
                      <span className="font-medium">
                        User offered per plate:
                      </span>{" "}
                      ₹{booking.pricing.user_offered_per_plate_price}
                    </Typography>
                  </Box>
                  <Box className="mb-2">
                    <Typography className="text-gray-600">
                      <span className="font-medium">Final per plate:</span> ₹
                      {booking.pricing.final_per_plate_price}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography className="text-gray-600">
                      <span className="font-medium">Total cost:</span> ₹
                      {booking.pricing.total_cost}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Selected Foods */}
              <Grid item xs={12} md={6}>
                <Paper className="p-6 rounded-lg shadow-md bg-gray-50">
                  <Typography
                    variant="h5"
                    className="font-semibold text-gray-700 mb-3"
                  >
                    Selected Foods
                  </Typography>
                  <Divider className="mb-3" />
                  {booking.selected_foods &&
                  booking.selected_foods.length > 0 ? (
                    <Box className="flex flex-wrap gap-2">
                      {booking.selected_foods.map((food) => (
                        <Chip
                          key={food._id}
                          label={`${food.name} - ₹${food.price}`}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography className="text-gray-600">
                      No food selected.
                    </Typography>
                  )}
                </Paper>
              </Grid>

              {/* Additional Services */}
              <Grid item xs={12} md={6}>
                <Paper className="p-6 rounded-lg shadow-md bg-gray-50">
                  <Typography
                    variant="h5"
                    className="font-semibold text-gray-700 mb-3"
                  >
                    Additional Services
                  </Typography>
                  <Divider className="mb-3" />
                  {booking.additional_services &&
                  booking.additional_services.length > 0 ? (
                    <ul className="list-disc list-inside text-gray-600">
                      {booking.additional_services.map((service) => (
                        <li key={service._id}>
                          <span className="font-medium">{service.name}:</span>{" "}
                          {service.description}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Typography className="text-gray-600">
                      No additional services selected.
                    </Typography>
                  )}
                </Paper>
              </Grid>

              {/* Cancellation Policy */}
              <Grid item xs={12} md={6}>
                <Paper className="p-6 rounded-lg shadow-md bg-gray-50">
                  <Typography
                    variant="h5"
                    className="font-semibold text-gray-700 mb-3"
                  >
                    Cancellation Policy
                  </Typography>
                  <Divider className="mb-3" />
                  <Typography className="text-gray-600">
                    Cancellation Fee: ₹
                    {booking.cancellation_policy.cancellation_fee}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Payment & Booking Status */}
            {isRequest &&
              (booking.status === "Pending" ||
                booking.status === "Accepted") && (
                <Box className="mt-6 flex flex-col md:flex-row justify-between items-center border-t pt-4">
                  <Box>
                    <Typography className="text-gray-600">
                      <span className="font-medium">Payment Status:</span>{" "}
                      {booking.payment_status}
                    </Typography>
                    <Typography className="text-gray-600 mt-1">
                      <span className="font-medium">Booking Status:</span>{" "}
                      {booking.status}
                    </Typography>
                  </Box>
                  <Box className="flex gap-4 mt-4 md:mt-0">
                    {booking.status === "Pending" && (
                      <>
                        <button
                          onClick={() => handleActionClick("approve")}
                          disabled={actionLoading}
                          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-md disabled:opacity-50"
                        >
                          {actionLoading ? "Processing..." : "Approve Request"}
                        </button>
                        <button
                          onClick={() => handleActionClick("reject")}
                          disabled={actionLoading}
                          className="border border-red-500 text-red-500 px-6 py-3 rounded-lg font-semibold hover:bg-red-500 hover:text-white transition shadow-md disabled:opacity-50"
                        >
                          {actionLoading ? "Processing..." : "Decline Request"}
                        </button>
                      </>
                    )}
                    {booking.status === "Accepted" && (
                      <button
                        onClick={() => handleActionClick("reject")}
                        disabled={actionLoading}
                        className="border border-red-500 text-red-500 px-6 py-3 rounded-lg font-semibold hover:bg-red-500 hover:text-white transition shadow-md disabled:opacity-50"
                      >
                        {actionLoading ? "Processing..." : "Reject Offer"}
                      </button>
                    )}
                  </Box>
                </Box>
              )}
          </div>
        </main>

        {/* Rejection Modal */}
        {showModal && modalType === "reject" && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 w-11/12 md:w-1/3">
              <h3 className="text-xl font-bold mb-4">Confirm Rejection</h3>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Reason for Rejection:
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows="3"
                  placeholder="Enter reason here..."
                ></textarea>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStatusUpdate("Rejected", reason)}
                  disabled={actionLoading || !reason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "Confirm Rejection"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventDetails;
