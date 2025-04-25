import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import VenueBookModel from "./modal/VenueBookModel";
import VenueSidebar from "./VenueSidebar";
import { toast } from "react-toastify";

const OwnerBooking = () => {
  const [approvedBookings, setApprovedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");

  const accessToken = localStorage.getItem("access_token");
  const venueId = localStorage.getItem("venueId");
  const navigate = useNavigate();

  // PATCH request to update booking status
  const handleStatusUpdate = async (bookingId, requestId, isCompleted) => {
    try {
      setIsUpdating(true);
      const response = await axios.patch(
        "http://localhost:8000/api/updateStatus",
        { bookingId, requestId, isCompleted },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.data.success) {
        toast.success(`Event marked as ${isCompleted ? "completed" : "running"}`);
        fetchApprovedBookings(); // Refresh the bookings list
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
      setOpenDialog(false);
      setSelectedBooking(null);
      setConfirmationText("");
    }
  };

  // Show the confirmation dialog when switch is clicked
  const handleToggleClick = (booking) => {
    setSelectedBooking(booking);
    setOpenDialog(true);
  };

  // Close dialog
  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedBooking(null);
    setConfirmationText("");
  };

  // Confirm and call the updater
  const handleConfirmStatus = () => {
    if (selectedBooking) {
      handleStatusUpdate(
        selectedBooking._id,
        selectedBooking.requestId,
        !selectedBooking.booking_statius
      );
    }
  };

  // Fetch approved bookings
  const fetchApprovedBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8000/api/booking/approved/${venueId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setApprovedBookings(response.data.bookings || []);
      if (response.data.bookings && response.data.bookings[0]) {
        setRequestId(response.data.bookings[0].requestId);
      }
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (venueId) {
      fetchApprovedBookings();
    }
    // eslint-disable-next-line
  }, [venueId]);

  const handleOpenCreate = () => {
    setOpenCreateModal(true);
  };

  const handleCloseCreate = () => {
    setOpenCreateModal(false);
    if (venueId) {
      fetchApprovedBookings();
    }
  };

  const handleBookingClick = (booking) => {
    navigate(`/venue-owner/approved-booking/${booking._id}`);
  };

  // Mapping for status badge Tailwind classes
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Accepted":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Cancelled":
        return "bg-gray-100 text-gray-800";
      case "Running":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Render a single booking card with updated, bold styling
  const renderBookingCard = (booking) => (
    <div
      key={booking._id}
      className="bg-white rounded-md shadow-md p-6 transition transform hover:-translate-y-1 hover:shadow-xl cursor-pointer"
      onClick={() => handleBookingClick(booking)}
    >
      <div className="flex justify-between items-center mb-4">
        <h6 className="text-2xl font-bold text-gray-800">
          {booking.event_details.event_type}
        </h6>
        <span className={`text-sm font-semibold px-2 py-1 rounded ${getStatusBadgeClass(booking.status)}`}>
          {booking.status}
        </span>
        {/* Updated toggle switch */}
        <div className="flex flex-col items-center ml-4" onClick={(e) => e.stopPropagation()}>
          <span className="text-xs font-medium text-gray-600 mb-1">Mark Completed</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={booking.booking_statius || false}
              onChange={() => handleToggleClick(booking)}
              disabled={isUpdating}
              className="sr-only peer"
            />
            <div className="w-12 h-7 bg-gray-200 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-400 peer-checked:bg-green-500 relative transition">
              <span className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow transform transition-all peer-checked:translate-x-5"></span>
            </div>
          </label>
        </div>
      </div>

      <hr className="my-2" />
      <p className="text-gray-700 text-sm mb-1">
        <strong>Date:</strong>{" "}
        <span className="font-bold">{new Date(booking.event_details.date).toLocaleDateString()}</span>
      </p>
      <p className="text-gray-700 text-sm mb-1">
        <strong>Guest Count:</strong>{" "}
        <span className="font-bold">{booking.event_details.guest_count}</span>
      </p>
      <p className="text-gray-700 text-sm mb-1">
        <strong>Hall:</strong>{" "}
        <span className="font-bold">{booking.hall?.name}</span>{" "}
        (Capacity: <span className="font-bold">{booking.hall?.capacity}</span>)
      </p>
      {booking.pricing?.total_cost && (
        <p className="text-gray-700 text-sm mb-1">
          <strong>Total Cost:</strong>{" "}
          <span className="font-bold">₹{booking.pricing.total_cost}</span>
        </p>
      )}

      <div className="mt-4">
        <p className="text-gray-800 text-base font-bold mb-2">Selected Foods:</p>
        <div className="flex flex-wrap gap-2">
          {booking.selected_foods && booking.selected_foods.length > 0 ? (
            booking.selected_foods.map((food) => (
              <span
                key={food._id}
                className="text-xs font-medium px-2 py-1 border border-gray-300 rounded"
              >
                {food.name}
              </span>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No food selected</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white">
      <VenueSidebar />
      <div className="flex-grow p-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-black">Approved Bookings</h1>
            {/* Uncomment to enable Create Booking button */}
            {/* <button 
                  onClick={handleOpenCreate}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Create Booking
                </button> */}
          </div>

          {loading && (
            <div className="w-full bg-blue-200 rounded-full h-2 mb-4">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse"></div>
            </div>
          )}
          {error && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded">
              {error}
            </div>
          )}
          {!loading && approvedBookings.length === 0 && (
            <div className="p-4 mb-4 text-sm text-blue-700 bg-blue-100 rounded">
              No approved bookings available.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {approvedBookings.map((booking) => renderBookingCard(booking))}
          </div>
        </div>
      </div>

      {/* Customized Modal Dialog for confirmation */}
      {openDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={handleDialogClose}>
              <div className="absolute inset-0 bg-black opacity-50"></div>
            </div>
            <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full z-50">
              <div className="px-6 py-4">
                <h3 className="text-lg font-bold text-gray-900">Confirm Event Completion</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to mark this event as completed?
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Please type <strong>YES</strong> below to confirm:
                  </p>
                  <input
                    type="text"
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
                    placeholder="Type YES to confirm"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end">
                <button
                  onClick={handleDialogClose}
                  className="mr-3 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
  onClick={handleConfirmStatus}
  disabled={confirmationText !== "YES" || isUpdating}
  className={`px-4 py-2 rounded text-white transition ${
    confirmationText === "YES" && !isUpdating
      ? "bg-green-600 hover:bg-green-700"
      : "bg-green-600 cursor-not-allowed"
  }`}
>
  {isUpdating ? (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  ) : (
    "Confirm"
  )}
</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Creating a Booking */}
      <VenueBookModel open={openCreateModal} onClose={handleCloseCreate} />
    </div>
  );
};

export default OwnerBooking;
