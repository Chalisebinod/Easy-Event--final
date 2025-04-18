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
  // Replace the single loading state with two separate ones:
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const accessToken = localStorage.getItem("access_token");
  const navigate = useNavigate();

  // Use optional chaining to safely generate a profile image URL.
  function getProfileImageUrl(profileImage) {
    if (!profileImage) {
      return "https://via.placeholder.com/40"; // fallback if no image
    }
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
          console.log("user", response.data.booking);
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

  // Show an alert message if booking status is not Pending.
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

  // New function to handle approve action
  const handleApprove = async () => {
    try {
      setIsApproving(true);
      const payload = { status: "Accepted", reason: "Request approved by venue owner" };
      const response = await axios.patch(
        `http://localhost:8000/api/booking/requests/${bookingId}`,
        payload,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.data.booking) {
        setBooking(response.data.booking);
        toast.success("Booking accepted successfully!");
        // Redirect after a short delay (adjust route if needed)
        setTimeout(() => {
          navigate("/user-request");
        }, 2000);
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Failed to update booking status");
    } finally {
      setIsApproving(false);
    }
  };

  // New function to handle reject action
  const handleReject = async () => {
    try {
      setIsRejecting(true);
      const payload = { status: "Rejected", reason };
      const response = await axios.patch(
        `http://localhost:8000/api/booking/requests/${bookingId}`,
        payload,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.data.booking) {
        setBooking(response.data.booking);
        toast.success("Booking rejected successfully!");
        // Redirect after a short delay (adjust route if needed)
        setTimeout(() => {
          navigate("/user-request");
        }, 2000);
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Failed to update booking status");
    } finally {
      setIsRejecting(false);
      setShowModal(false);
    }
  };

  const handleActionClick = (type) => {
    setModalType(type);
    if (type === "reject") {
      setReason("");
      setShowModal(true);
    } else if (type === "approve") {
      handleApprove();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex bg-gray-100">
        <VenueSidebar />
        <div className="flex-1 p-10 flex flex-col items-center justify-center w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-4 border-gray-700"></div>
          <p className="mt-5 text-lg text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex bg-gray-100">
        <VenueSidebar />
        <div className="flex-1 p-10 flex flex-col items-center justify-center w-full">
          <div className="text-center text-red-600 text-xl">
            {error || "Booking not found"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <VenueSidebar />
      <div className="flex-1 relative w-full">
        <ToastContainer position="top-right" />
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 bg-white shadow-md border-b border-gray-200 px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-extrabold text-gray-800">
              {isRequest ? "Booking Request Details" : "Booking Details"}
            </h1>
          </div>
        </header>

        {/* Toast Alert */}
        {showAlert && (
          <div className="fixed top-6 right-6 z-50">
            <div className="flex items-start p-4 space-x-3 bg-green-50 rounded-lg shadow-lg border-l-4 border-green-500">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-green-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
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
        <main className="py-12 px-2 bg-gradient-to-b from-white to-gray-100 min-h-screen w-full">
          <div className="w-full bg-white p-10 rounded-3xl shadow-2xl border border-gray-200 transform transition hover:scale-105">
            {/* User Info */}
            <div className="flex items-center gap-6 mb-10 border-b pb-6">
              <img
                src={getProfileImageUrl(booking.user?.profile_image)}
                alt="User Profile"
                className="w-24 h-24 rounded-full border-4 border-gray-300 shadow-md"
              />
              <div>
                {booking.user ? (
                  <>
                    <h3 className="text-3xl font-semibold text-gray-800">
                      {booking.user.name}
                    </h3>
                    <p className="text-gray-500 text-base flex items-center gap-2">
                      <FaEnvelope className="text-blue-500" />
                      {booking.user.email}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500">User information not available.</p>
                )}
              </div>
            </div>

            <Grid container spacing={8}>
              {/* Event Information */}
              <Grid item xs={12} md={6}>
                <Paper className="p-8 rounded-2xl shadow-lg bg-gray-50">
                  <Typography variant="h5" className="font-semibold text-gray-700 mb-4">
                    Event Information
                  </Typography>
                  <Divider className="mb-4" />
                  <div className="flex items-center gap-3 mb-3">
                    <FaUserTie className="text-green-500" />
                    <Typography className="text-gray-600 text-base">
                      {booking.event_details?.event_type || "N/A"}
                    </Typography>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <FaCalendarAlt className="text-indigo-500" />
                    <Typography className="text-gray-600 text-base">
                      {booking.event_details?.date
                        ? new Date(booking.event_details.date).toLocaleDateString()
                        : "N/A"}
                    </Typography>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaUtensils className="text-red-500" />
                    <Typography className="text-gray-600 text-base">
                      Guests: {booking.event_details?.guest_count ?? "N/A"}
                    </Typography>
                  </div>
                </Paper>
              </Grid>

              {/* Venue & Hall Details */}
              <Grid item xs={12} md={6}>
                <Paper className="p-8 rounded-2xl shadow-lg bg-gray-50">
                  <Typography variant="h5" className="font-semibold text-gray-700 mb-4">
                    Venue & Hall
                  </Typography>
                  <Divider className="mb-4" />
                  <div className="flex items-center gap-3 mb-3">
                    <FaMapMarkerAlt className="text-pink-500" />
                    <Typography className="text-gray-600 text-base">
                      {booking.venue?.name
                        ? `${booking.venue.name} – ${booking.venue.location?.address || ""}, ${booking.venue.location?.city || ""}`
                        : "No venue info"}
                    </Typography>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaBuilding className="text-purple-500" />
                    <Typography className="text-gray-600 text-base">
                      {booking.hall?.name
                        ? `${booking.hall.name} (Capacity: ${booking.hall.capacity})`
                        : "No hall info"}
                    </Typography>
                  </div>
                </Paper>
              </Grid>

              {/* Pricing Details */}
              <Grid item xs={12} md={6}>
                <Paper className="p-8 rounded-2xl shadow-lg bg-gray-50">
                  <Typography variant="h5" className="font-semibold text-gray-700 mb-4">
                    Pricing Details
                  </Typography>
                  <Divider className="mb-4" />
                  <div className="mb-3">
                    <Typography className="text-gray-600 text-base">
                      <span className="font-medium">Original per plate:</span>{" "}
                      ₹{booking.pricing?.original_per_plate_price ?? "N/A"}
                    </Typography>
                  </div>
                  <div className="mb-3">
                    <Typography className="text-gray-600 text-base">
                      <span className="font-medium">User offered per plate:</span>{" "}
                      ₹{booking.pricing?.user_offered_per_plate_price ?? "N/A"}
                    </Typography>
                  </div>
                  <div className="mb-3">
                    <Typography className="text-gray-600 text-base">
                      <span className="font-medium">Final per plate:</span>{" "}
                      ₹{booking.pricing?.final_per_plate_price ?? "N/A"}
                    </Typography>
                  </div>
                  <div>
                    <Typography className="text-gray-600 text-base">
                      <span className="font-medium">Total cost:</span>{" "}
                      ₹{booking.pricing?.total_cost ?? "N/A"}
                    </Typography>
                  </div>
                </Paper>
              </Grid>

              {/* Selected Foods */}
              <Grid item xs={12} md={6}>
                <Paper className="p-8 rounded-2xl shadow-lg bg-gray-50">
                  <Typography variant="h5" className="font-semibold text-gray-700 mb-4">
                    Selected Foods
                  </Typography>
                  <Divider className="mb-4" />
                  {Array.isArray(booking.selected_foods) && booking.selected_foods.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {booking.selected_foods.map((food) => (
                        <Chip
                          key={food?._id}
                          label={`${food.name} - ₹${food.price}`}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </div>
                  ) : (
                    <Typography className="text-gray-600">No food selected.</Typography>
                  )}
                </Paper>
              </Grid>

              {/* Additional Services */}
              <Grid item xs={12} md={6}>
                <Paper className="p-8 rounded-2xl shadow-lg bg-gray-50">
                  <Typography variant="h5" className="font-semibold text-gray-700 mb-4">
                    Additional Services
                  </Typography>
                  <Divider className="mb-4" />
                  {Array.isArray(booking.additional_services) &&
                  booking.additional_services.length > 0 ? (
                    <ul className="list-disc list-inside text-gray-600 text-base">
                      {booking.additional_services.map((service) => (
                        <li key={service?._id}>
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
                <Paper className="p-8 rounded-2xl shadow-lg bg-gray-50">
                  <Typography variant="h5" className="font-semibold text-gray-700 mb-4">
                    Cancellation Policy
                  </Typography>
                  <Divider className="mb-4" />
                  <Typography className="text-gray-600 text-base">
                    Cancellation Fee: ₹
                    {booking.cancellation_policy?.cancellation_fee ?? "N/A"}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Payment & Booking Status */}
            {isRequest &&
              (booking.status === "Pending" ||
                booking.status === "Accepted") && (
                <div className="mt-8 flex flex-col md:flex-row justify-between items-center border-t pt-6 w-full">
                  <div>
                    <Typography className="text-gray-600 text-base">
                      <span className="font-medium">Payment Status:</span>{" "}
                      {booking.payment_status ?? "N/A"}
                    </Typography>
                    <Typography className="text-gray-600 text-base mt-1">
                      <span className="font-medium">Booking Status:</span>{" "}
                      {booking.status ?? "N/A"}
                    </Typography>
                  </div>
                  <div className="flex gap-6 mt-6 md:mt-0">
                    {booking.status === "Pending" && (
                      <>
                        <button
                          onClick={() => handleActionClick("approve")}
                          disabled={isApproving || isRejecting}
                          className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition shadow-md disabled:opacity-50"
                        >
                          {isApproving ? "Processing..." : "Approve Request"}
                        </button>
                        <button
                          onClick={() => handleActionClick("reject")}
                          disabled={isApproving || isRejecting}
                          className="px-8 py-3 border border-red-500 text-red-500 rounded-xl font-semibold hover:bg-red-500 hover:text-white transition shadow-md disabled:opacity-50"
                        >
                          {isRejecting ? "Processing..." : "Decline Request"}
                        </button>
                      </>
                    )}
                    {booking.status === "Accepted" && (
                      <button
                        onClick={() => handleActionClick("reject")}
                        disabled={isApproving || isRejecting}
                        className="px-8 py-3 border border-red-500 text-red-500 rounded-xl font-semibold hover:bg-red-500 hover:text-white transition shadow-md disabled:opacity-50"
                      >
                        {isRejecting ? "Processing..." : "Reject Offer"}
                      </button>
                    )}
                  </div>
                </div>
              )}
          </div>
        </main>

        {/* Rejection Modal */}
        {showModal && modalType === "reject" && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-2xl p-8 w-full sm:w-11/12 md:w-1/3 shadow-xl">
              <h3 className="text-2xl font-bold mb-6">Confirm Rejection</h3>
              <div className="mb-6">
                <label className="block text-gray-700 mb-3 font-medium">
                  Reason for Rejection:
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                  rows="3"
                  placeholder="Enter reason here..."
                ></textarea>
              </div>
              <div className="flex justify-end gap-6">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={isRejecting || isApproving}
                  className="px-5 py-2 border border-gray-400 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={isRejecting || !reason.trim()}
                  className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  {isRejecting ? "Processing..." : "Confirm Rejection"}
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
