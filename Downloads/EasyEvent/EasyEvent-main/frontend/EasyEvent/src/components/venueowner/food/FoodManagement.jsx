import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from "@mui/material";
import { Add, Edit, Delete, Close } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VenueSidebar from "../VenueSidebar";

const FoodManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const accessToken = localStorage.getItem("access_token");
  const venueId = localStorage.getItem("venueID");

  /* ------------------ Food Items Management ------------------ */
  const [foods, setFoods] = useState([]);
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [foodCategories, setFoodCategories] = useState([]);

  // Modal state for Food Item creation/editing
  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [foodForm, setFoodForm] = useState({
    mealType: "starter",
    category: "",
    name: "",
    price: "",
    description: "",
    custom_options: "", // comma separated string
  });

  // Modal state for creating a new category
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    mealType: "starter",
  });

  // Fetch Food Items for the current venue
  const fetchFoods = async () => {
    setLoadingFoods(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/api/food/venue/${venueId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setFoods(response.data.foods || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching foods");
    } finally {
      setLoadingFoods(false);
    }
  };

  // Fetch Food Categories for the current venue
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/foodCategory/${venueId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setFoodCategories(response.data.categories || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching categories");
    }
  };

  useEffect(() => {
    fetchFoods();
    fetchCategories();
  }, [accessToken, venueId]);

  const openFoodModal = (food = null) => {
    if (food) {
      setEditingFood(food);
      setFoodForm({
        mealType: food.mealType,
        category: food.category,
        name: food.name,
        price: food.price,
        description: food.description || "",
        custom_options: food.custom_options
          ? food.custom_options.join(", ")
          : "",
      });
    } else {
      setEditingFood(null);
      setFoodForm({
        mealType: "starter",
        category: "",
        name: "",
        price: "",
        description: "",
        custom_options: "",
      });
    }
    setFoodModalOpen(true);
  };

  const closeFoodModal = () => {
    setFoodModalOpen(false);
  };

  const handleFoodFormChange = (e) => {
    const { name, value } = e.target;
    setFoodForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveFood = async () => {
    try {
      const payload = {
        ...foodForm,
        custom_options: foodForm.custom_options.split(",").map((s) => s.trim()),
        venue: venueId,
      };
      if (editingFood) {
        const response = await axios.patch(
          `http://localhost:8000/api/food/${editingFood._id}`,
          payload,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setFoods(
          foods.map((f) => (f._id === editingFood._id ? response.data.food : f))
        );
        toast.success("Food updated successfully!");
      } else {
        const response = await axios.post(
          "http://localhost:8000/api/food/add",
          payload,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setFoods([response.data.food, ...foods]);
        toast.success("Food created successfully!");
      }
      closeFoodModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving food");
    }
  };

  const handleDeleteFood = async (foodId) => {
    try {
      await axios.delete(`http://localhost:8000/api/food/${foodId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setFoods(foods.filter((food) => food._id !== foodId));
      toast.success("Food deleted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting food");
    }
  };

  // Delete a category from Food Categories
  const handleDeleteCategory = async (categoryId) => {
    try {
      await axios.delete(
        `http://localhost:8000/api/foodCategory/${categoryId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setFoodCategories(foodCategories.filter((cat) => cat._id !== categoryId));
      toast.success("Category deleted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting category");
    }
  };

  // Handle category modal save
  const handleSaveCategory = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/foodCategory/create",
        { ...newCategory, venue: venueId },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      // Add new category to state
      setFoodCategories([...foodCategories, response.data.category]);
      // Auto-select the new category in the food form
      setFoodForm((prev) => ({
        ...prev,
        category: response.data.category.name,
      }));
      setCategoryModalOpen(false);
      setNewCategory({ name: "", mealType: foodForm.mealType });
      toast.success("Category created successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating category");
    }
  };

  // Handle tab change – here we have only one tab for Food Items
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box display="flex" minHeight="100vh" bgcolor="#f8f9fa">
      {/* Sidebar */}
      <VenueSidebar />

      {/* Main Content Area */}
      <Box flexGrow={1} p={3}>
        <ToastContainer position="top-center" autoClose={3000} />
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", marginBottom: 3 }}
        >
          Food Management
        </Typography>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          textColor="primary"
          indicatorColor="primary"
          sx={{ marginBottom: 3 }}
        >
          <Tab label="Food Items" />
        </Tabs>

        {/* Food Items Tab */}
        {activeTab === 0 && (
          <Box mt={4}>
            <Box display="flex" justifyContent="flex-end" mb={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => openFoodModal()}
                startIcon={<Add />}
              >
                Create Food
              </Button>
            </Box>
            {loadingFoods ? (
              <Typography align="center">Loading foods...</Typography>
            ) : (
              <Grid container spacing={3}>
                {foods.map((food) => (
                  <Grid item xs={12} sm={6} md={4} key={food._id}>
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        boxShadow: 3,
                        transition: "transform 0.3s",
                        "&:hover": { transform: "scale(1.02)" },
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {food.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ marginBottom: 1 }}
                      >
                        {food.mealType.toUpperCase()} - {food.category}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: "bold", color: "#2e7d32" }}
                      >
                        ${food.price}
                      </Typography>
                      {food.description && (
                        <Typography
                          variant="caption"
                          display="block"
                          sx={{ mt: 1, color: "#757575" }}
                        >
                          {food.description}
                        </Typography>
                      )}
                      <Box mt={2} display="flex" justifyContent="flex-end">
                        <IconButton
                          onClick={() => openFoodModal(food)}
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteFood(food._id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Food Item Modal */}
            <Dialog
              open={foodModalOpen}
              onClose={() => setFoodModalOpen(false)}
              fullWidth
              maxWidth="sm"
            >
              <DialogTitle>
                {editingFood ? "Edit Food" : "Create Food"}
                <IconButton
                  onClick={() => setFoodModalOpen(false)}
                  sx={{ position: "absolute", right: 8, top: 8 }}
                >
                  <Close />
                </IconButton>
              </DialogTitle>
              <DialogContent dividers>
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel id="meal-type-label">Meal Type</InputLabel>
                  <Select
                    labelId="meal-type-label"
                    name="mealType"
                    value={foodForm.mealType}
                    onChange={handleFoodFormChange}
                    label="Meal Type"
                  >
                    <MenuItem value="starter">Starter</MenuItem>
                    <MenuItem value="launch">Launch</MenuItem>
                    <MenuItem value="dinner">Dinner</MenuItem>
                  </Select>
                </FormControl>
                {/* Category selection with "Create New Category" option */}
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    name="category"
                    value={foodForm.category}
                    onChange={(e) => {
                      if (e.target.value === "__create_new__") {
                        setCategoryModalOpen(true);
                      } else {
                        handleFoodFormChange(e);
                      }
                    }}
                    label="Category"
                  >
                    {foodCategories
                      .filter((cat) => cat.mealType === foodForm.mealType)
                      .map((cat) => (
                        <MenuItem key={cat._id} value={cat.name}>
                          {cat.name}
                        </MenuItem>
                      ))}
                    <MenuItem value="__create_new__">
                      <em>Create New Category</em>
                    </MenuItem>
                  </Select>
                </FormControl>
                {/* List existing categories for selected meal type with delete option */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Existing Categories for {foodForm.mealType.toUpperCase()}:
                  </Typography>
                  {foodCategories
                    .filter((cat) => cat.mealType === foodForm.mealType)
                    .map((cat) => (
                      <Box
                        key={cat._id}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                          border: "1px solid #e0e0e0",
                          borderRadius: 1,
                          p: 1,
                          mb: 1,
                        }}
                      >
                        <Typography>{cat.name}</Typography>
                        <IconButton
                          onClick={() => handleDeleteCategory(cat._id)}
                          color="error"
                          size="small"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                </Box>
                <TextField
                  name="name"
                  label="Food Name"
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 2 }}
                  value={foodForm.name}
                  onChange={handleFoodFormChange}
                />
                <TextField
                  name="price"
                  label="Price"
                  type="number"
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 2 }}
                  value={foodForm.price}
                  onChange={handleFoodFormChange}
                />
                <TextField
                  name="description"
                  label="Description"
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 2 }}
                  multiline
                  rows={3}
                  value={foodForm.description}
                  onChange={handleFoodFormChange}
                />
                {/* <TextField
                  name="custom_options"
                  label="Custom Options (comma separated)"
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 2 }}
                  value={foodForm.custom_options}
                  onChange={handleFoodFormChange}
                /> */}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setFoodModalOpen(false)} color="inherit">
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveFood}
                  variant="contained"
                  color="primary"
                >
                  Save
                </Button>
              </DialogActions>
            </Dialog>

            {/* Category Creation Modal */}
            <Dialog
              open={categoryModalOpen}
              onClose={() => setCategoryModalOpen(false)}
              fullWidth
              maxWidth="sm"
            >
              <DialogTitle>
                Create New Food Category
                <IconButton
                  onClick={() => setCategoryModalOpen(false)}
                  sx={{ position: "absolute", right: 8, top: 8 }}
                >
                  <Close />
                </IconButton>
              </DialogTitle>
              <DialogContent dividers>
                <TextField
                  label="Category Name"
                  fullWidth
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  sx={{ mt: 2 }}
                />
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel id="new-category-mealtype-label">
                    Meal Type
                  </InputLabel>
                  <Select
                    labelId="new-category-mealtype-label"
                    name="mealType"
                    value={newCategory.mealType}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        mealType: e.target.value,
                      })
                    }
                    label="Meal Type"
                  >
                    <MenuItem value="starter">Starter</MenuItem>
                    <MenuItem value="launch">Launch</MenuItem>
                    <MenuItem value="dinner">Dinner</MenuItem>
                  </Select>
                </FormControl>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => setCategoryModalOpen(false)}
                  color="inherit"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveCategory}
                  variant="contained"
                  color="primary"
                >
                  Save
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default FoodManagement;
