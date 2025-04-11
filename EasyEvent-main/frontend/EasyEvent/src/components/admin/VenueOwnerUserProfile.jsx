import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  Grid,
  Typography,
  Button,
  Box,
  Paper,
  Avatar,
  TextField,
} from "@mui/material";
import DashboardLayout from "./DashboardLayout";

const VenueOwnerUserProfile = () => {
  const { id } = useParams(); // Get the venue owner ID from the URL
  const [venueOwner, setVenueOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState(""); // For holding the reason text
  const [status, setStatus] = useState(""); // For holding the status value (pending/verified)

  useEffect(() => {
    const fetchVenueOwnerDetails = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get(
          `http://localhost:8000/api/venueOwnerProfile/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setVenueOwner(response.data); // Set the fetched data
      } catch (error) {
        console.error("Error fetching venue owner details:", error);
      } finally {
        setLoading(false); // Set loading to false once the data is fetched
      }
    };

    fetchVenueOwnerDetails();
  }, [id]);

  if (loading) {
    return <p>Loading...</p>;
  }

  const handleBlockUser = () => {
    if (!reason) {
      alert("Please provide a reason for blocking the user.");
      return;
    }
    alert(`Blocking user with reason: ${reason}`);
    // Make an API call to block the user and send the reason here
  };

  const handleChangeStatus = (status) => {
    if (!reason) {
      alert("Please provide a reason for changing the status.");
      return;
    }
    setStatus(status);
    alert(`Changing status to ${status} with reason: ${reason}`);
    // Make an API call to update the status with the reason here
  };

  return (
    <>
      <DashboardLayout />{" "}
      {/* Wrap DesktopLayout and the content inside a fragment */}
      <Box sx={{ padding: 3, marginLeft: "16rem" }}>
        {" "}
        {/* Add margin-left to push content right */}
        {venueOwner ? (
          <Paper sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom>
              {venueOwner.name}'s Profile
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6">Name:</Typography>
                <Typography>{venueOwner.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6">Email:</Typography>
                <Typography>{venueOwner.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6">Contact:</Typography>
                <Typography>{venueOwner.contact_number}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6">Location:</Typography>
                <Typography>{venueOwner.location}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6">Status:</Typography>
                <Typography>{venueOwner.status || "Missing status"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6">Verified:</Typography>
                <Typography>{venueOwner.verified ? "Yes" : "No"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6">Profile Image:</Typography>
                <Avatar
                  alt={venueOwner.name}
                  src={venueOwner.profile_image || "/path/to/default-image.jpg"}
                  sx={{ width: 100, height: 100 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6">Citizenship Front:</Typography>
                <Typography
                  sx={{
                    color: venueOwner.pcitizenship_front ? "inherit" : "red",
                  }}
                >
                  {venueOwner.citizenship_front
                    ? "Uploaded"
                    : "Missing citizenship front"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6">Citizenship Back:</Typography>
                <Typography
                  sx={{
                    color: venueOwner.citizenship_back ? "inherit" : "red",
                  }}
                >
                  {venueOwner.citizenship_back
                    ? "Uploaded"
                    : "Missing citizenship back"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6">PAN Card / VAT:</Typography>
                <Typography
                  sx={{ color: venueOwner.pan_card_vat ? "inherit" : "red" }}
                >
                  {venueOwner.pan_card_vat
                    ? "Uploaded"
                    : "Missing PAN card/VAT"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6">Created At:</Typography>
                <Typography>
                  {venueOwner.date_created || "Missing creation date"}
                </Typography>
              </Grid>
            </Grid>

            {/* Reason Input Field */}
            <Box sx={{ marginTop: 3 }}>
              <TextField
                label="Reason for Action"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Box>

            {/* Admin Action Buttons */}
            <Box sx={{ marginTop: 3 }}>
              <Button
                variant="contained"
                color="error"
                sx={{ marginRight: 2 }}
                onClick={handleBlockUser}
              >
                Block User
              </Button>
              <Button
                variant="contained"
                color="primary"
                sx={{ marginRight: 2 }}
                onClick={() => handleChangeStatus("pending")}
              >
                Set Status to Pending
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleChangeStatus("verified")}
              >
                Set Status to Verified
              </Button>
            </Box>
          </Paper>
        ) : (
          <p>No profile found.</p>
        )}
      </Box>
    </>
  );
};

export default VenueOwnerUserProfile;
