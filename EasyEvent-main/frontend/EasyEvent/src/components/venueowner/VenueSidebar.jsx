import React, { useEffect, useState, forwardRef } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  Badge,
  Divider,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Slide,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  RequestQuote as RequestQuoteIcon,
  Event as EventIcon,
  Payments as PaymentsIcon,
  AccountBalance as AccountBalanceIcon,
  AccountCircle as ProfileIcon,
  Store as StoreIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Image as GalleryIcon,
  VerifiedUser as KycIcon,
} from "@mui/icons-material";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import RateReviewIcon from "@mui/icons-material/RateReview"; 
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const drawerWidth = 250;

// Logout Dialog Transition
const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const VenueSidebar = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationCount, setNotificationCount] = useState(0);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [userId, setUserId] = useState(null);

  // Fetch venue owner profile to get the user ID
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        const response = await axios.get(
          "http://localhost:8000/api/venueOwner/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUserId(response.data._id);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get(
          "http://localhost:8000/api/notification/getUnreads",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotificationCount(response.data.count || 0);
      } catch (error) {
        console.error("Error fetching notification count:", error);
      }
    };

    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const openLogoutDialog = () => setLogoutDialogOpen(true);
  const closeLogoutDialog = () => setLogoutDialogOpen(false);

  // Highlight active menu item
  const getNavItemStyle = (path) => ({
    margin: "6px 8px",
    borderRadius: "4px",
    backgroundColor: location.pathname === path ? "#e0e0e0" : "transparent",
    transition: "background-color 0.2s ease",
    "& .MuiListItemIcon-root, & .MuiListItemText-primary": { color: "#333" },
    "&:hover": { backgroundColor: "#f5f5f5" },
  });

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      {/* Sidebar Drawer */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#fff",
            color: "#333",
            borderRight: "1px solid #ddd",
          },
        }}
        variant="permanent"
        anchor="left"
      >
        {/* Sidebar Header */}
        <Box
          sx={{
            textAlign: "center",
            p: 3,
            backgroundColor: "#fff",
            mb: 2,
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            borderRadius: 1,
          }}
        >
          <Typography variant="h5" sx={{ color: "#FF8C00", fontWeight: "bold" }}>
            EasyEvent
          </Typography>
        </Box>

        {/* Navigation Links */}
        <List>
          <ListItem
            button
            component={Link}
            to="/venue-owner-dashboard"
            sx={getNavItemStyle("/venue-owner-dashboard")}
          >
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>

          <ListItem
            button
            component={Link}
            to="/user-request"
            sx={getNavItemStyle("/user-request")}
          >
            <ListItemIcon>
              <RequestQuoteIcon />
            </ListItemIcon>
            <ListItemText primary="Request" />
          </ListItem>

          <ListItem
            button
            component={Link}
            to="/bookings-owner"
            sx={getNavItemStyle("/bookings-owner")}
          >
            <ListItemIcon>
              <BookOnlineIcon />
            </ListItemIcon>
            <ListItemText primary="Bookings" />
          </ListItem>

          <ListItem
            button
            component={Link}
            to="/foodManagement"
            sx={getNavItemStyle("/foodManagement")}
          >
            <ListItemIcon>
              <AccountBalanceIcon />
            </ListItemIcon>
            <ListItemText primary="Food Management" />
          </ListItem>

          <ListItem
            button
            component={Link}
            to="/halls"
            sx={getNavItemStyle("/halls")}
          >
            <ListItemIcon>
              <StoreIcon />
            </ListItemIcon>
            <ListItemText primary="Halls" />
          </ListItem>

          <ListItem
            button
            component={Link}
            to="/notification"
            sx={getNavItemStyle("/notification")}
          >
            <ListItemIcon>
              <Badge badgeContent={notificationCount} color="error">
                <NotificationsIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="Notifications" />
          </ListItem>

          <ListItem
            button
            component={Link}
            to="/transaction"
            sx={getNavItemStyle("/transaction")}
          >
            <ListItemIcon>
              <PaymentsIcon />
            </ListItemIcon>
            <ListItemText primary="Payments" />
          </ListItem>

          <ListItem
            button
            component={Link}
            to="/agreement"
            sx={getNavItemStyle("/agreement")}
          >
            <ListItemIcon>
              <AccountBalanceIcon />
            </ListItemIcon>
            <ListItemText primary="Agreement" />
          </ListItem>

          <ListItem
            button
            component={Link}
            to="/chat"
            sx={getNavItemStyle("/chat")}
          >
            <ListItemIcon>
              <EventIcon />
            </ListItemIcon>
            <ListItemText primary="Chat" />
          </ListItem>

          <ListItem
            button
            component={Link}
            to={`/venueOwner-profile/${userId}`}
            sx={getNavItemStyle(`/venueOwner-profile/${userId}`)}
          >
            <ListItemIcon>
              <ProfileIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItem>

  

          {/* <ListItem
            button
            component={Link}
            to="/reviews"
            sx={getNavItemStyle("/reviews")}
          >
            <ListItemIcon>
              <RateReviewIcon />
            </ListItemIcon>
            <ListItemText primary="Reviews" />
          </ListItem> */}

          <ListItem
            button
            component={Link}
            to="/venueOwnerKyc"
            sx={getNavItemStyle("/venueOwnerKyc")}
          >
            <ListItemIcon>
              <KycIcon />
            </ListItemIcon>
            <ListItemText primary="KYC" />
          </ListItem>
        </List>

        <Divider sx={{ borderColor: "#ddd", my: 2 }} />

        {/* Logout Button */}
        <List>
          <ListItem
            button
            onClick={openLogoutDialog}
            sx={{
              margin: "6px 8px",
              borderRadius: "4px",
              "&:hover": { backgroundColor: "#f5f5f5" },
            }}
          >
            <ListItemIcon>
              <LogoutIcon sx={{ color: "#333" }} />
            </ListItemIcon>
            <ListItemText primary="Logout" sx={{ color: "#333" }} />
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>

      {/* Logout Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={closeLogoutDialog}
        TransitionComponent={Transition}
        PaperProps={{ sx: { borderRadius: 2, p: 2, minWidth: "320px" } }}
      >
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.25rem" }}>
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to log out?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeLogoutDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleLogout}
            variant="contained"
            sx={{
              backgroundColor: "#e53935",
              color: "#fff",
              "&:hover": { backgroundColor: "#d32f2f" },
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VenueSidebar;
