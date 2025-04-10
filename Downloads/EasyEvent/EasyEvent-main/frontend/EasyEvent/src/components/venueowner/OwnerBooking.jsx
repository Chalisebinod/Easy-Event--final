import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
  Divider,
  LinearProgress,
  Alert,
  Chip,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
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

  // NEW: Local state for confirmation text
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
        {
          bookingId,
          requestId,
          isCompleted,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.data.success) {
        toast.success(
          `Event marked as ${isCompleted ? "completed" : "running"}`
        );
        fetchApprovedBookings(); // Refresh the bookings list
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
      setOpenDialog(false);
      setSelectedBooking(null);
      // Reset the dialog text field after closing
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
    // Refetch approved bookings after creating a new one
    if (venueId) {
      fetchApprovedBookings();
    }
  };

  const handleBookingClick = (booking) => {
    navigate(`/venue-owner/approved-booking/${booking._id}`);
  };

  // Mapping for status chip colors
  const getStatusChipColor = (status) => {
    const colors = {
      Pending: "warning",
      Accepted: "success",
      Rejected: "error",
      Cancelled: "default",
      Running: "info",
      Completed: "secondary",
    };
    return colors[status] || "default";
  };

  // Render a single booking card
  const renderBookingCard = (booking) => (
    <Grid item xs={12} md={6} key={booking._id}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 2,
          cursor: "pointer",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: 6,
          },
        }}
        onClick={() => handleBookingClick(booking)}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">
            {booking.event_details.event_type}
          </Typography>
          <Chip
            label={booking.status}
            color={getStatusChipColor(booking.status)}
            size="small"
          />

          {/* Wrap switch in a Box to prevent parent onClick from firing */}
          <Box onClick={(e) => e.stopPropagation()}>
            <p>Mark completed</p>
            <Switch
              checked={booking.booking_statius || false}
              onChange={() => handleToggleClick(booking)}
              disabled={isUpdating}
              color="success"
            />
          </Box>
        </Box>

        <Divider sx={{ my: 1 }} />
        <Typography variant="body2" color="text.secondary">
          <strong>Date:</strong>{" "}
          {new Date(booking.event_details.date).toLocaleDateString()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Guest Count:</strong> {booking.event_details.guest_count}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Hall:</strong> {booking.hall?.name} (Capacity:{" "}
          {booking.hall?.capacity})
        </Typography>
        {booking.pricing?.total_cost && (
          <Typography variant="body2" color="text.secondary">
            <strong>Total Cost:</strong> ₹{booking.pricing.total_cost}
          </Typography>
        )}
        <Box mt={2}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Foods:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {booking.selected_foods && booking.selected_foods.length > 0 ? (
              booking.selected_foods.map((food) => (
                <Chip
                  key={food._id}
                  label={food.name}
                  size="small"
                  variant="outlined"
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No food selected
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>
    </Grid>
  );

  return (
    <Box display="flex" minHeight="100vh" bgcolor="background.default">
      <VenueSidebar />
      <Box flexGrow={1} p={3}>
        <Container maxWidth="lg">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={4}
          >
            <Typography variant="h4" component="h1" fontWeight="bold">
              Approved Bookings
            </Typography>
            {/* <Button variant="contained" color="primary" onClick={handleOpenCreate}>
              Create Booking
            </Button> */}
          </Box>

          {loading && <LinearProgress />}
          {error && <Alert severity="error">{error}</Alert>}
          {!loading && approvedBookings.length === 0 && (
            <Alert severity="info">No approved bookings available.</Alert>
          )}

          <Grid container spacing={3}>
            {approvedBookings.map((booking) => renderBookingCard(booking))}
          </Grid>
        </Container>
      </Box>

      {/* Dialog for confirmation (with text field) */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Confirm Event Completion</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to mark this event as completed?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please type <strong>YES</strong> below to confirm:
          </Typography>
          <TextField
            autoFocus
            margin="normal"
            label="Type YES to confirm"
            fullWidth
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleConfirmStatus}
            disabled={confirmationText !== "YES" || isUpdating}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal for Creating a Booking */}
      <VenueBookModel open={openCreateModal} onClose={handleCloseCreate} />
    </Box>
  );
};

export default OwnerBooking;
