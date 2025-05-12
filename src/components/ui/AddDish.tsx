import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Stack,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Autocomplete,
  Box,
  CircularProgress,
  Avatar,
  styled
} from '@mui/material';
import { 
  Close, 
  CloudUpload, 
  Image as ImageIcon 
} from '@mui/icons-material';
import { useEffect, useState, useRef } from 'react';
import axiosInstance from '../../interceptor/axiosInstance';
import React from 'react';

interface CreateItemProps {
  open: boolean;
  onClose: () => void;
  outlet_id: number;
}

// Define the food type and cuisine options
const FOOD_TYPES = ["THALI", "CURRY", "RICE", "BREAD", "DESSERT", "BEVERAGE", "SNACK", "MAIN_COURSE", "STARTER"];
const CUISINES = ["NORTH_INDIAN", "SOUTH_INDIAN", "CHINESE", "CONTINENTAL", "ITALIAN", "FAST_FOOD", "DESSERTS"];

// Styled components for file upload
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function AddDish({ open, onClose, outlet_id }: CreateItemProps) {
  const [formState, setFormState] = useState({
    item_name: '',
    vendor_price: '',
    status: 1,
    outlet_id: outlet_id,
    description: '',
    opening_time: '10:00',
    closing_time: '22:00',
    is_vegeterian: 1,
    image: '',
    cuisine: 'NORTH_INDIAN',
    food_type: 'THALI',
    bulk_only: 0,
    tax: 0
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Convert numeric fields to numbers
    if (
      name === "vendor_price" || 
      name === "bulk_only" ||
      name === "is_vegeterian" || 
      name === "status"
    ) {
      const numValue = Number(value);
      
      // Auto-calculate tax as 5% of vendor_price when vendor_price changes
      if (name === "vendor_price") {
        setFormState((prevState:any) => ({
          ...prevState,
          [name]: numValue,
          tax: (numValue * 0.05).toFixed(2) // 5% of vendor price, rounded to nearest integer
        }));
      } else {
        setFormState(prevState => ({
          ...prevState,
          [name]: numValue,
        }));
      }
    } else {
      setFormState(prevState => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  // Handle select changes for cuisine and food_type
  const handleSelectChange = (name: string, value: string | null) => {
    setFormState(prevState => ({
      ...prevState,
      [name]: value || (name === 'cuisine' ? 'NORTH_INDIAN' : 'THALI'),
    }));
  };

  // Handle image file selection
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    
    // Maximum file size: 2MB
    if (file.size > 2 * 1024 * 1024) {
      alert('File is too large. Maximum size is 2MB.');
      setUploadingImage(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      setSelectedImage(base64String);
      setFormState(prevState => ({
        ...prevState,
        image: base64String,
      }));
      setUploadingImage(false);
    };
    
    reader.onerror = () => {
      alert('Error reading file');
      setUploadingImage(false);
    };
    
    reader.readAsDataURL(file);
  };

  const handleCreateItem = async () => {
    // Validate required fields
    if (!formState.item_name || !formState.vendor_price) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formState,
        outlet_id: outlet_id,
      };
      
      // Updated endpoint from /dish to /item
      const response = await axiosInstance.post('/dish', payload);
      
      if (response.data.status !== 1) {
        throw new Error('Creation failed');
      }
      
      onClose();
    } catch (error) {
      console.error('Creation failed:', error);
      alert('Creation failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog fullScreen open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Create New Menu Item</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} mt={1.5}>
          {/* Image Upload Section */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            mb: 2
          }}>
            <Box 
              sx={{
                width: 120,
                height: 120,
                borderRadius: 2,
                mb: 1.5,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'hidden',
                border: '1px dashed rgba(0,0,0,0.2)'
              }}
            >
              {uploadingImage ? (
                <CircularProgress size={30} />
              ) : selectedImage ? (
                <Box
                  component="img"
                  src={selectedImage}
                  alt="Dish preview"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <ImageIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
              )}
            </Box>
            
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUpload />}
              size="small"
              sx={{ borderRadius: 1.5 }}
            >
              Upload Image
              <VisuallyHiddenInput 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                ref={fileInputRef}
              />
            </Button>
          </Box>

          <TextField 
            fullWidth 
            label="Item Name" 
            name="item_name" 
            value={formState.item_name} 
            onChange={handleChange} 
            required
          />
          
          <FormLabel component="legend">Item Type</FormLabel>
          <RadioGroup 
            row 
            name="is_vegeterian" 
            value={formState.is_vegeterian} 
            onChange={handleChange}
          >
            <FormControlLabel value={1} control={<Radio />} label="Vegetarian" />
            <FormControlLabel value={0} control={<Radio />} label="Non-Vegetarian" />
          </RadioGroup>

          <Stack direction="row" spacing={2} alignItems="center">
            <TextField 
              fullWidth 
              label="Vendor Price (₹)" 
              type="number" 
              name="vendor_price" 
              value={formState.vendor_price} 
              onChange={handleChange} 
              required
              helperText="Tax will be calculated as 5% of vendor price"
            />
            {formState.vendor_price && (
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                Tax: ₹{formState.tax}
              </Typography>
            )}
          </Stack>

          <Autocomplete
            options={CUISINES}
            value={formState.cuisine}
            onChange={(_, newValue) => handleSelectChange('cuisine', newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Cuisine" variant="outlined" required />
            )}
            getOptionLabel={(option) => option.split('_').map(word => 
              word.charAt(0) + word.slice(1).toLowerCase()
            ).join(' ')}
            clearOnEscape
          />

          <Autocomplete
            options={FOOD_TYPES}
            value={formState.food_type}
            onChange={(_, newValue) => handleSelectChange('food_type', newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Food Type" variant="outlined" required />
            )}
            getOptionLabel={(option) => option.split('_').map(word => 
              word.charAt(0) + word.slice(1).toLowerCase()
            ).join(' ')}
            clearOnEscape
          />

          <TextField 
            fullWidth 
            label="Description" 
            multiline 
            rows={3} 
            name="description" 
            value={formState.description} 
            onChange={handleChange} 
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField 
              fullWidth 
              label="Opening Time" 
              type="time" 
              name="opening_time" 
              value={formState.opening_time} 
              InputLabelProps={{ shrink: true }} 
              onChange={handleChange} 
            />
            <TextField 
              fullWidth 
              label="Closing Time" 
              type="time" 
              name="closing_time" 
              value={formState.closing_time} 
              InputLabelProps={{ shrink: true }} 
              onChange={handleChange} 
            />
          </Stack>

          {/* Tax is now auto-calculated based on vendor price */}

          <FormLabel component="legend">Bulk Order Only?</FormLabel>
          <RadioGroup 
            row 
            name="bulk_only" 
            value={formState.bulk_only} 
            onChange={handleChange}
          >
            <FormControlLabel value={0} control={<Radio />} label="No" />
            <FormControlLabel value={1} control={<Radio />} label="Yes" />
          </RadioGroup>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button  
          sx={{bgcolor:'#EB8041', color:'white'}} 
          onClick={handleCreateItem} 
          variant="contained" 
          disabled={submitting || uploadingImage}
        >
          {submitting ? "Creating..." : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}