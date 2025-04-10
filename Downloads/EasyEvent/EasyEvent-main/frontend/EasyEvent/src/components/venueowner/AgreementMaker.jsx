import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  Box,
  Button,
  TextField,
  Typography,
  Divider,
  Paper,
  Tab,
  Tabs,
  IconButton,
  Container,
  Alert,
} from "@mui/material";
import { Delete as DeleteIcon, Star as StarIcon, Edit as EditIcon } from "@mui/icons-material";
import VenueSidebar from "./VenueSidebar";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AgreementMaker = () => {
  // Template Management State
  const [templates, setTemplates] = useState({
    terms: [],
    rules: [],
    cancellation: []
  });
  const [tabValue, setTabValue] = useState(0);
  const [newTemplate, setNewTemplate] = useState({
    title: "",
    content: "",
    type: "terms"
  });
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    content: ""
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const venueId = localStorage.getItem("venueId");
      const response = await axios.get(
        `http://localhost:8000/api/booking/templates/${venueId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
        }
      );

      if (response.data.success) {
        const sortedTemplates = {
          terms: response.data.templates.filter(t => t.type === "terms"),
          rules: response.data.templates.filter(t => t.type === "rules"),
          cancellation: response.data.templates.filter(t => t.type === "cancellation")
        };
        setTemplates(sortedTemplates);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to fetch templates");
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const venueId = localStorage.getItem("venueId");
      const response = await axios.post(
        "http://localhost:8000/api/booking/templates",
        {
          ...newTemplate,
          type: ["terms", "rules", "cancellation"][tabValue],
          venue: venueId
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
        }
      );

      if (response.data.success) {
        toast.success("Template created successfully");
        setNewTemplate({ title: "", content: "" });
        fetchTemplates();
      }
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("Failed to create template");
    }
  };

  const handleSetDefaultTemplate = async (templateId) => {
    try {
      const response = await axios.put(
        `http://localhost:8000/api/booking/templates/${templateId}/set-default`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
        }
      );

      if (response.data.success) {
        toast.success("Default template updated");
        fetchTemplates();
      }
    } catch (error) {
      console.error("Error setting default template:", error);
      toast.error("Failed to set default template");
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      // Find the template to check if it's default
      const templateType = ["terms", "rules", "cancellation"][tabValue];
      const templateToDelete = templates[templateType].find(t => t._id === templateId);
      
      if (templateToDelete?.isDefault) {
        toast.warning("Please set another template as default before deleting this one.");
        return;
      }

      const response = await axios.delete(
        `http://localhost:8000/api/booking/templates/${templateId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchTemplates();
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete template";
      toast.error(errorMessage);
    }
  };

  // Add a helper function to check if delete should be disabled
  const isDeleteDisabled = (template) => {
    const templateType = ["terms", "rules", "cancellation"][tabValue];
    const typeTemplates = templates[templateType] || [];
    return typeTemplates.length <= 1 || template.isDefault;
  };

  const getTemplateTypeLabel = (index) => {
    const labels = {
      0: "Terms & Conditions",
      1: "Venue Rules",
      2: "Cancellation Policy"
    };
    return labels[index];
  };

  const handleEditTemplate = async () => {
    try {
      const response = await axios.put(
        `http://localhost:8000/api/booking/templates/${editingTemplate._id}`,
        {
          title: editForm.title,
          content: editForm.content
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
        }
      );

      if (response.data.success) {
        toast.success("Template updated successfully");
        setEditingTemplate(null);
        setEditForm({ title: "", content: "" });
        fetchTemplates();
      }
    } catch (error) {
      console.error("Error updating template:", error);
      toast.error("Failed to update template");
    }
  };

  const startEditing = (template) => {
    setEditingTemplate(template);
    setEditForm({
      title: template.title,
      content: template.content
    });
    setNewTemplate({ title: "", content: "" }); // Clear new template form
  };

  const cancelEditing = () => {
    setEditingTemplate(null);
    setEditForm({ title: "", content: "" });
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <VenueSidebar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Agreement Templates
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            Create and manage templates for your venue's terms, rules, and cancellation policies.
            These templates can be reused when creating agreements.
          </Alert>

          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => {
              setTabValue(newValue);
              setNewTemplate({ ...newTemplate, content: "" });
            }}
            sx={{ mb: 3 }}
          >
            <Tab label="Terms & Conditions" />
            <Tab label="Venue Rules" />
            <Tab label="Cancellation Policy" />
          </Tabs>

          {/* Create/Edit Template Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              {editingTemplate ? `Edit ${editingTemplate.title}` : `Create New ${getTemplateTypeLabel(tabValue)} Template`}
            </Typography>
            <TextField
              fullWidth
              label="Template Title"
              value={editingTemplate ? editForm.title : newTemplate.title}
              onChange={(e) => 
                editingTemplate 
                  ? setEditForm({ ...editForm, title: e.target.value })
                  : setNewTemplate({ ...newTemplate, title: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <ReactQuill
              value={editingTemplate ? editForm.content : newTemplate.content}
              onChange={(content) => 
                editingTemplate
                  ? setEditForm({ ...editForm, content })
                  : setNewTemplate({ ...newTemplate, content })
              }
              style={{ height: "200px", marginBottom: "50px" }}
            />
            {editingTemplate ? (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleEditTemplate}
                  disabled={!editForm.title || !editForm.content}
                  sx={{ mr: 2 }}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  onClick={cancelEditing}
                >
                  Cancel
                </Button>
              </Box>
            ) : (
              <Button
                variant="contained"
                onClick={handleCreateTemplate}
                disabled={!newTemplate.title || !newTemplate.content}
                sx={{ mt: 2 }}
              >
                Create Template
              </Button>
            )}
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Existing Templates Section */}
          <Typography variant="h6" gutterBottom>
            Existing {getTemplateTypeLabel(tabValue)} Templates
          </Typography>
          {templates[["terms", "rules", "cancellation"][tabValue]]?.map((template) => (
            <Paper key={template._id} sx={{ p: 3, mb: 2, bgcolor: "grey.50" }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" color={template.isDefault ? "primary" : "textPrimary"}>
                  {template.title} {template.isDefault && "(Default)"}
                </Typography>
                <Box>
                  <IconButton
                    onClick={() => startEditing(template)}
                    color="primary"
                    title="Edit Template"
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleSetDefaultTemplate(template._id)}
                    color={template.isDefault ? "primary" : "default"}
                    title={template.isDefault ? "Default Template" : "Set as Default"}
                  >
                    <StarIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteTemplate(template._id)}
                    color="error"
                    disabled={isDeleteDisabled(template)}
                    title={
                      template.isDefault 
                        ? "Cannot delete default template" 
                        : templates[["terms", "rules", "cancellation"][tabValue]].length <= 1
                          ? "Cannot delete the only template"
                          : "Delete Template"
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
              <div 
                dangerouslySetInnerHTML={{ __html: template.content }}
                style={{ 
                  backgroundColor: "white", 
                  padding: "16px", 
                  borderRadius: "4px",
                  border: "1px solid #e0e0e0" 
                }}
              />
            </Paper>
          ))}

          {templates[["terms", "rules", "cancellation"][tabValue]]?.length === 0 && (
            <Alert severity="info">
              No templates found. Create your first {getTemplateTypeLabel(tabValue).toLowerCase()} template.
            </Alert>
          )}
        </Paper>
      </Container>
    </div>
  );
};

export default AgreementMaker;
