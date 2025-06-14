import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  InputAdornment,
  CircularProgress,
  Alert,
  Avatar,
  IconButton,
  Divider,
  Paper,
  Chip
} from "@mui/material";
import {
  CurrencyRupee,
  AccessTime,
  PhotoCamera,
  Close,
  Restaurant,
  Schedule,
  LocalOffer,
  Info
} from "@mui/icons-material";
import axiosInstance from "../../interceptor/axiosInstance";

interface EditDishProps {
  open: boolean;
  onClose: () => void;
  item: MenuItem | null;
  onSuccess?: () => void;
}

interface MenuItem {
  item_id: number;
  item_name: string;
  status: number;
  outlet_id: number;
  description: string;
  vendor_price: number;
  opening_time: string;
  closing_time: string;
  is_vegeterian: number;
  image: string;
  cuisine: string;
  food_type: string;
  bulk_only: number;
  customisations: any;
  customisation_defaultBasePrice: any;
  station_code: string;
}

const EditDish: React.FC<EditDishProps> = ({ open, onClose, item, onSuccess }) => {
  const [formData, setFormData] = useState({
    item_name: "",
    description: "",
    vendor_price: "",
    opening_time: "",
    closing_time: "",
    is_vegeterian: 0,
    cuisine: "",
    food_type: "",
    bulk_only: 0,
    image: "",
    status: 1
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cuisine options
  const cuisineOptions = [
    { value: "NORTH_INDIAN", label: "North Indian" },
    { value: "SOUTH_INDIAN", label: "South Indian" },
    { value: "CHINESE", label: "Chinese" },
    { value: "CONTINENTAL", label: "Continental" },
    { value: "ITALIAN", label: "Italian" },
    { value: "MEXICAN", label: "Mexican" },
    { value: "THAI", label: "Thai" },
    { value: "JAPANESE", label: "Japanese" },
    { value: "FAST_FOOD", label: "Fast Food" },
    { value: "DESSERTS", label: "Desserts" },
    { value: "BEVERAGES", label: "Beverages" }
  ];

  // Food type options
  const foodTypeOptions = [
    { value: "STARTERS", label: "Starters" },
    { value: "MAINS", label: "Mains" },
    { value: "DESSERTS", label: "Desserts" },
    { value: "BEVERAGES", label: "Beverages" },
    { value: "SNACKS", label: "Snacks" },
    { value: "RICE", label: "Rice" },
    { value: "BREAD", label: "Bread" },
    { value: "CURRY", label: "Curry" }
  ];

  // Initialize form data when item changes
  useEffect(() => {
    if (item && open) {
      setFormData({
        item_name: item.item_name || "",
        description: item.description || "",
        vendor_price: item.vendor_price?.toString() || "",
        opening_time: item.opening_time || "",
        closing_time: item.closing_time || "",
        is_vegeterian: item.is_vegeterian || 0,
        cuisine: item.cuisine || "",
        food_type: item.food_type || "",
        bulk_only: item.bulk_only || 0,
        image: item.image || "",
        status: item.status || 1
      });
      setError("");
    }
  }, [item, open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.item_name.trim()) {
      setError("Item name is required");
      return false;
    }
 
    if (!formData.vendor_price || parseFloat(formData.vendor_price) <= 0) {
      setError("Valid vendor price is required");
      return false;
    }
    if (!formData.cuisine) {
      setError("Cuisine selection is required");
      return false;
    }
    if (!formData.food_type) {
      setError("Food type selection is required");
      return false;
    }
    if (!formData.opening_time) {
      setError("Opening time is required");
      return false;
    }
    if (!formData.closing_time) {
      setError("Closing time is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !item) return;

    try {
      setLoading(true);
      setError("");

      const payload = {
        item_name: formData.item_name.trim(),
        description: formData.description.trim(),
        vendor_price: parseFloat(formData.vendor_price),
        opening_time: formData.opening_time,
        closing_time: formData.closing_time,
        is_vegeterian: formData.is_vegeterian,
        cuisine: formData.cuisine,
        food_type: formData.food_type,
        bulk_only: formData.bulk_only,
        image: formData.image.trim(),
        status: formData.status,
        verified: true,
        change_type:1
        
      };

      await axiosInstance.put(`/dish/${item.item_id}`, payload);
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error: any) {
      console.error("Error updating dish:", error);
      setError(error?.response?.data?.message || "Failed to update menu item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          maxHeight: "95vh",
          backgroundColor: "#fafafa"
        }
      }}
    >
      <DialogTitle sx={{ pb: 2, backgroundColor: "white", borderRadius: "16px 16px 0 0" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                backgroundColor: "#EB8041",
                borderRadius: 2,
                p: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Restaurant sx={{ color: "white", fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                Edit Menu Item
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Update your dish information and settings
              </Typography>
            </Box>
          </Stack>
          <IconButton 
            onClick={handleClose} 
            disabled={loading}
            sx={{
              backgroundColor: "grey.100",
              "&:hover": { backgroundColor: "grey.200" }
            }}
          >
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 0, backgroundColor: "#fafafa" }}>
        <Stack spacing={0}>
          {error && (
            <Box sx={{ p: 3, pb: 0 }}>
              <Alert 
                severity="error" 
                sx={{ 
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "error.light",
                  backgroundColor: "error.50"
                }}
              >
                {error}
              </Alert>
            </Box>
          )}

          {/* Image Section */}
          <Paper sx={{ m: 3, mb: 0, borderRadius: 3, overflow: "hidden" }}>
            <Box sx={{ p: 3, backgroundColor: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <PhotoCamera sx={{ color: "#EB8041" }} />
                <Typography variant="h6" fontWeight={600} color="text.primary">
                  Dish Image
                </Typography>
              </Stack>
              
              <Stack direction="row" spacing={3} alignItems="center">
                <Avatar
                  src={formData.image}
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: "grey.100",
                    border: "4px solid white",
                    boxShadow: 3
                  }}
                >
                  <PhotoCamera fontSize="large" color="disabled" />
                </Avatar>
                
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="Image URL"
                    value={formData.image}
                    onChange={(e) => handleInputChange("image", e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "white",
                        borderRadius: 2
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    Enter a valid image URL to display your dish photo
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Paper>

          {/* Basic Information Section */}
          <Paper sx={{ m: 3, mb: 0, borderRadius: 3, overflow: "hidden" }}>
            <Box sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Info sx={{ color: "#EB8041" }} />
                <Typography variant="h6" fontWeight={600} color="text.primary">
                  Basic Information
                </Typography>
              </Stack>

              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Item Name"
                  value={formData.item_name}
                  onChange={(e) => handleInputChange("item_name", e.target.value)}
                  required
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2
                    }
                  }}
                />

                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  multiline
                  rows={3}
                  placeholder="Brief description of the dish..."
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2
                    }
                  }}
                />

                <Box sx={{ maxWidth: 300 }}>
                  <TextField
                    fullWidth
                    label="Vendor Price"
                    value={formData.vendor_price}
                    onChange={(e) => handleInputChange("vendor_price", e.target.value)}
                    type="number"
                    required
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CurrencyRupee fontSize="small" sx={{ color: "#EB8041" }} />
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2
                      }
                    }}
                  />
                </Box>
              </Stack>
            </Box>
          </Paper>

          {/* Category Section */}
          <Paper sx={{ m: 3, mb: 0, borderRadius: 3, overflow: "hidden" }}>
            <Box sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <LocalOffer sx={{ color: "#EB8041" }} />
                <Typography variant="h6" fontWeight={600} color="text.primary">
                  Category & Type
                </Typography>
              </Stack>

              <Stack direction="row" spacing={3}>
                <FormControl sx={{ flex: 1 }} required>
                  <InputLabel>Cuisine</InputLabel>
                  <Select
                    value={formData.cuisine}
                    onChange={(e) => handleInputChange("cuisine", e.target.value)}
                    label="Cuisine"
                    sx={{
                      borderRadius: 2
                    }}
                  >
                    {cuisineOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ flex: 1 }} required>
                  <InputLabel>Food Type</InputLabel>
                  <Select
                    value={formData.food_type}
                    onChange={(e) => handleInputChange("food_type", e.target.value)}
                    label="Food Type"
                    sx={{
                      borderRadius: 2
                    }}
                  >
                    {foodTypeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Box>
          </Paper>

          {/* Timing Section */}
          <Paper sx={{ m: 3, mb: 0, borderRadius: 3, overflow: "hidden" }}>
            <Box sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Schedule sx={{ color: "#EB8041" }} />
                <Typography variant="h6" fontWeight={600} color="text.primary">
                  Operating Hours
                </Typography>
              </Stack>

              <Stack direction="column" spacing={3}>
                <TextField
                  sx={{ flex: 1 }}
                  label="Opening Time"
                  value={formData.opening_time}
                  onChange={(e) => handleInputChange("opening_time", e.target.value)}
                  type="time"
                  required
                  InputLabelProps={{
                    shrink: true
                  }}
                 
                />

                <TextField
                  sx={{ flex: 1 }}
                  label="Closing Time"
                  value={formData.closing_time}
                  onChange={(e) => handleInputChange("closing_time", e.target.value)}
                  type="time"
                  required
                 
                  InputLabelProps={{
                    shrink: true
                  }}
                  
                />
              </Stack>
            </Box>
          </Paper>

          {/* Settings Section */}
          <Paper sx={{ m: 3, borderRadius: 3, overflow: "hidden" }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 3 }}>
                Item Settings
              </Typography>

              <Stack spacing={2}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: formData.is_vegeterian === 1 ? "#e8f5e8" : "#fafafa",
                    border: "1px solid",
                    borderColor: formData.is_vegeterian === 1 ? "#4caf50" : "grey.200"
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Vegetarian Item
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Mark this item as vegetarian-friendly
                        </Typography>
                      </Box>
                      {formData.is_vegeterian === 1 && (
                        <Chip 
                          label="VEG" 
                          size="small" 
                          sx={{ 
                            backgroundColor: "#4caf50", 
                            color: "white",
                            fontWeight: 600
                          }} 
                        />
                      )}
                    </Stack>
                    <Switch
                      checked={formData.is_vegeterian === 1}
                      onChange={(e) => handleInputChange("is_vegeterian", e.target.checked ? 1 : 0)}
                      color="success"
                    />
                  </Stack>
                </Paper>

                <Paper 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: formData.bulk_only === 1 ? "#fff3e0" : "#fafafa",
                    border: "1px solid",
                    borderColor: formData.bulk_only === 1 ? "#ff9800" : "grey.200"
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Bulk Orders Only
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Available only for bulk orders
                        </Typography>
                      </Box>
                      {formData.bulk_only === 1 && (
                        <Chip 
                          label="BULK" 
                          size="small" 
                          sx={{ 
                            backgroundColor: "#ff9800", 
                            color: "white",
                            fontWeight: 600
                          }} 
                        />
                      )}
                    </Stack>
                    <Switch
                      checked={formData.bulk_only === 1}
                      onChange={(e) => handleInputChange("bulk_only", e.target.checked ? 1 : 0)}
                      color="warning"
                    />
                  </Stack>
                </Paper>

                <Paper 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: formData.status === 1 ? "#e3f2fd" : "#ffebee",
                    border: "1px solid",
                    borderColor: formData.status === 1 ? "#2196f3" : "#f44336"
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Available (In Stock)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Item is available for ordering
                        </Typography>
                      </Box>
                     
                    </Stack>
                    <Switch
                      checked={formData.status === 1}
                      onChange={(e) => handleInputChange("status", e.target.checked ? 1 : 0)}
                      color="primary"
                    />
                  </Stack>
                </Paper>
              </Stack>
            </Box>
          </Paper>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, backgroundColor: "white", borderRadius: "0 0 16px 16px" }}>
        <Stack direction="row" spacing={2} sx={{ width: "100%", justifyContent: "flex-end" }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              borderColor: "grey.300",
              color: "text.secondary",
              minWidth: 100
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: "#EB8041",
              "&:hover": {
               boxShadow: 4,
                bgcolor: "#D26E2F"
              },
              borderRadius: 2,
              px: 4,
              py: 1,
              minWidth: 140,
              boxShadow: 3,
              
            }}
          >
            {loading ? (
              <Stack direction="row" alignItems="center" spacing={1}>
                <CircularProgress size={16} color="inherit" />
                <Typography variant="button">Updating...</Typography>
              </Stack>
            ) : (
              "Update Item"
            )}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default EditDish;