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
    Autocomplete
  } from '@mui/material';
  import { Close } from '@mui/icons-material';
  import { useEffect, useState } from 'react';
  import axiosInstance from '../../interceptor/axiosInstance';
  import React from 'react';
  
  interface CreateZoneProps {
    open: boolean;
    onClose: () => void;
    res_id: any;
  }
  
  export default function AddDish({ open, onClose, res_id }: CreateZoneProps) {
    const [formState, setFormState] = useState({
      name: '',
      dish_type: 1,
      res_id: res_id,
      dish_cat_id: 0,
      dish_price: '',
      media_url: '',
      aggregator_item_id: 0,
      description: '',
      opening_time: new Date().toISOString().split("T")[1],
      closing_time: new Date().toISOString().split("T")[1],
      tax: 0,
      cuisine: 0,
      food_type: 0
    });
  
    const [categories, setCategories] = useState<any[]>([]);
    const [foodTypes, setFoodTypes] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
    const [selectedFoodType, setSelectedFoodType] = useState<any | null>(null);
    const [loadingData, setLoadingData] = useState(false);
    const [submitting, setSubmitting] = useState(false);
  
    // Fetch dish categories and food types on mount
    useEffect(() => {
      async function fetchData() {
        setLoadingData(true);
        try {
          const [catResponse, foodTypeResponse] = await Promise.all([
            axiosInstance.get('/dish-cat'),
            axiosInstance.get('/food-type')
          ]);
  
          if (catResponse.data.status !== 1 || foodTypeResponse.data.status !== 1) {
            throw new Error('Unexpected response status');
          }
  
          setCategories(catResponse.data.data.rows);
          setFoodTypes(foodTypeResponse.data.data.rows);
        } catch (error) {
          console.error('Error fetching data:', error);
          alert('Error fetching initial data');
        } finally {
          setLoadingData(false);
        }
      }
      fetchData();
    }, []);
  
    // Update form state based on selected category and food type
    useEffect(() => {
      setFormState((prevState) => ({
        ...prevState,
        cuisine: Number(selectedCategory?.dish_cat_id) || 0,
        food_type: Number(selectedFoodType?.food_type_id) || 0
      }));
    }, [selectedCategory, selectedFoodType]);
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      if(name=="dish_price" || name == "aggregator_item_id" || name =="tax")
      {
        setFormState((prevState) => ({
            ...prevState,
            [name]: Number(value),
          }));
      }
      else{
          setFormState((prevState) => ({
              ...prevState,
              [name]: value,
            }));
        }
    };
    console.log(formState)
  
    const handleCreateDish = async () => {
      setSubmitting(true);
      try {
        const payload = {
          ...formState,
          res_id:res_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          stock: 1
        };
        const response = await axiosInstance.post('/dish', payload);
        if (response.data.status !== 1) {
          throw new Error('Creation failed');
        }
        // Optionally, you can refetch or update parent state here if needed
        onClose();
      } catch (error) {
        console.error('Creation failed:', error);
        alert('Creation failed. Please try again.');
      } finally {
        setSubmitting(false);
      }
    };
  console.log(formState)
    return (
      <Dialog fullScreen open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Create New Dish</Typography>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField 
              fullWidth 
              label="Dish Name" 
              name="name" 
              value={formState.name} 
              onChange={handleChange} 
            />
            <FormLabel component="legend">Dish Type</FormLabel>
            <RadioGroup 
              row 
              name="dish_type" 
              value={formState.dish_type} 
              onChange={handleChange}
            >
              <FormControlLabel value={1} control={<Radio />} label="Veg" />
              <FormControlLabel value={0} control={<Radio />} label="Non-Veg" />
            </RadioGroup>
            {categories.length > 0 && (
              <Autocomplete
                options={categories}
                getOptionLabel={(option) => option.cat_name}
                value={selectedCategory}
                onChange={(_, newValue) => setSelectedCategory(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Cuisine" variant="outlined" />
                )}
                clearOnEscape
              />
            )}
            {foodTypes.length > 0 && (
              <Autocomplete
                options={foodTypes}
                getOptionLabel={(option) => option.food_cat}
                value={selectedFoodType}
                onChange={(_, newValue) => setSelectedFoodType(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Food Type" variant="outlined" />
                )}
                clearOnEscape
              />
            )}
            <TextField 
              fullWidth 
              label="Dish Price" 
              type="number" 
              name="dish_price" 
              value={formState.dish_price} 
              onChange={handleChange} 
            />
            <TextField 
              fullWidth 
              label="Media URL" 
              type="text" 
              name="media_url" 
              value={formState.media_url} 
              onChange={handleChange} 
            />
            <TextField 
              fullWidth 
              label="Aggregator Item ID" 
              type="number" 
              name="aggregator_item_id" 
              value={formState.aggregator_item_id} 
              onChange={handleChange} 
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
            <TextField 
              fullWidth 
              label="Tax (%)" 
              type="number" 
              name="tax" 
              value={formState.tax} 
              onChange={handleChange} 
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button  sx={{bgcolor:'#EB8041',color:'white'}} onClick={handleCreateDish} variant="contained" disabled={submitting}>
            {submitting ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
  