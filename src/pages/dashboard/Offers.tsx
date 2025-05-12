import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import axiosInstance from '../../interceptor/axiosInstance';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

// Define types for our promotion structure
interface DiscountRequirement {
  type: 'AMOUNT' | 'PAYMENT_TYPE' | string;
  minimumOrderAmount?: number;
  paymentType?: 'PRE_PAID' | 'POST_PAID' | string;
}

interface DiscountDetails {
  type: 'PERCENTAGE' | 'FIXED' | string;
  value: number;
  maxDiscount: number;
}

interface Promotion {
  requirement: DiscountRequirement;
  discount: DiscountDetails;
}

interface RestaurantData {
  id: number;
  name: string;
  promotions: Promotion[];
  [key: string]: any; // For other restaurant fields
}

const REQUIREMENT_TYPES = ['AMOUNT', 'PAYMENT_TYPE'];
const PAYMENT_TYPES = ['PRE_PAID', 'POST_PAID'];
const DISCOUNT_TYPES = ['PERCENTAGE', 'FIXED'];

const Offers: React.FC = () => {
  // Tab state
  const [tabValue, setTabValue] = useState(0);

  // Get outlet ID from localStorage
  
  // Restaurant data state
  const [restaurantData, setRestaurantData] = useState<RestaurantData | null>(null);
  
  // Promotions state (separate from restaurantData for editing purposes)
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  
  const outletid = useSelector((state: RootState) => state.outlet_id);

  
  // New promotion form state
  const [newPromotion, setNewPromotion] = useState<Promotion>({
    requirement: {
      type: 'AMOUNT',
      minimumOrderAmount: 0
    },
    discount: {
      type: 'PERCENTAGE',
      value: 0,
      maxDiscount: 0
    }
  });
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  
  // Fetch restaurant data
  const fetchRestaurantData = async() => {
    if (!outletid) return;
    
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/restraunts/?outlet_id=${outletid?.outlet_id}`);
      setRestaurantData(response?.data?.data?.rows[0]);
      setPromotions(response?.data?.data?.rows[0]?.promotions.promotions || []);
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load restaurant data. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
      fetchRestaurantData();
  }, []);
  console.log(promotions,restaurantData)
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle form input changes for new promotion
  const handleRequirementTypeChange = (value: string) => {
    if (value === 'AMOUNT') {
      setNewPromotion({
        ...newPromotion,
        requirement: {
          type: value,
          minimumOrderAmount: 0
        }
      });
    } else if (value === 'PAYMENT_TYPE') {
      setNewPromotion({
        ...newPromotion,
        requirement: {
          type: value,
          paymentType: 'PRE_PAID',
          minimumOrderAmount: 0
        }
      });
    }
  };
  
  const handleMinimumOrderAmountChange = (value: number) => {
    setNewPromotion({
      ...newPromotion,
      requirement: {
        ...newPromotion.requirement,
        minimumOrderAmount: value
      }
    });
  };
  
  const handlePaymentTypeChange = (value: string) => {
    setNewPromotion({
      ...newPromotion,
      requirement: {
        ...newPromotion.requirement,
        paymentType: value
      }
    });
  };
  
  const handleDiscountTypeChange = (value: string) => {
    setNewPromotion({
      ...newPromotion,
      discount: {
        ...newPromotion.discount,
        type: value
      }
    });
  };
  
  const handleDiscountValueChange = (value: number) => {
    setNewPromotion({
      ...newPromotion,
      discount: {
        ...newPromotion.discount,
        value: value
      }
    });
  };
  
  const handleMaxDiscountChange = (value: number) => {
    setNewPromotion({
      ...newPromotion,
      discount: {
        ...newPromotion.discount,
        maxDiscount: value
      }
    });
  };
  
  // Reset form
  const resetForm = () => {
    setNewPromotion({
      requirement: {
        type: 'AMOUNT',
        minimumOrderAmount: 0
      },
      discount: {
        type: 'PERCENTAGE',
        value: 0,
        maxDiscount: 0
      }
    });
  };
  
  // Add new promotion
  const addPromotion = () => {
    // Validation
    if (newPromotion.requirement.type === 'AMOUNT' && 
        (newPromotion.requirement.minimumOrderAmount === undefined || 
         newPromotion.requirement.minimumOrderAmount <= 0)) {
      setSnackbar({
        open: true,
        message: 'Minimum order amount must be greater than 0',
        severity: 'error'
      });
      return;
    }
    
    if (newPromotion.requirement.type === 'PAYMENT_TYPE' && 
        (!newPromotion.requirement.paymentType || 
         newPromotion.requirement.minimumOrderAmount === undefined || 
         newPromotion.requirement.minimumOrderAmount <= 0)) {
      setSnackbar({
        open: true,
        message: 'Please select a payment type and enter a minimum order amount greater than 0',
        severity: 'error'
      });
      return;
    }
    
    if (newPromotion.discount.value <= 0) {
      setSnackbar({
        open: true,
        message: 'Discount value must be greater than 0',
        severity: 'error'
      });
      return;
    }
    
    // Add promotion
    const updatedPromotions = [...promotions, newPromotion];
    setPromotions(updatedPromotions);
    
    // Show success message
    setSnackbar({
      open: true,
      message: 'Promotion added successfully! Remember to save changes.',
      severity: 'success'
    });
    
    // Reset form
    resetForm();
  };
  
  // Save promotions to backend
  const savePromotions = async () => {
    if (!outletid) {
      setSnackbar({
        open: true,
        message: 'Outlet ID not found',
        severity: 'error'
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Only send the promotions array as payload
      await axiosInstance.put(`/restraunt/${outletid.outlet_id}`, {"promotions":{promotions} });
      
      setSnackbar({
        open: true,
        message: 'Promotions saved successfully!',
        severity: 'success'
      });
      
      // Refresh data
      fetchRestaurantData();
    } catch (error) {
      console.error('Error saving promotions:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save promotions. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Delete promotion
  const deletePromotion = (index: number) => {
    const updatedPromotions = [...promotions];
    updatedPromotions.splice(index, 1);
    setPromotions(updatedPromotions);
    
    setSnackbar({
      open: true,
      message: 'Promotion removed. Remember to save changes!',
      severity: 'success'
    });
  };
  
  // Edit promotion
  const openEditDialog = (index: number) => {
    setEditingIndex(index);
    setEditingPromotion(JSON.parse(JSON.stringify(promotions[index])));
    setEditDialogOpen(true);
  };
  
  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditingIndex(null);
    setEditingPromotion(null);
  };
  
  const saveEditedPromotion = () => {
    if (!editingPromotion || editingIndex === null) return;
    
    // Validation
    if (editingPromotion.requirement.type === 'AMOUNT' && 
        (editingPromotion.requirement.minimumOrderAmount === undefined || 
         editingPromotion.requirement.minimumOrderAmount <= 0)) {
      setSnackbar({
        open: true,
        message: 'Minimum order amount must be greater than 0',
        severity: 'error'
      });
      return;
    }
    
    if (editingPromotion.requirement.type === 'PAYMENT_TYPE' && 
        (!editingPromotion.requirement.paymentType || 
         editingPromotion.requirement.minimumOrderAmount === undefined || 
         editingPromotion.requirement.minimumOrderAmount <= 0)) {
      setSnackbar({
        open: true,
        message: 'Please select a payment type and enter a minimum order amount greater than 0',
        severity: 'error'
      });
      return;
    }
    
    if (editingPromotion.discount.value <= 0) {
      setSnackbar({
        open: true,
        message: 'Discount value must be greater than 0',
        severity: 'error'
      });
      return;
    }
    
    const updatedPromotions = [...promotions];
    updatedPromotions[editingIndex] = editingPromotion;
    setPromotions(updatedPromotions);
    console.log(updatedPromotions)
    
    setSnackbar({
      open: true,
      message: 'Promotion updated successfully! Remember to save changes.',
      severity: 'success'
    });
    
    closeEditDialog();
  };
  
  // Handle edit dialog form changes
  const handleEditRequirementTypeChange = (value: string) => {
    if (!editingPromotion) return;
    
    if (value === 'AMOUNT') {
      setEditingPromotion({
        ...editingPromotion,
        requirement: {
          type: value,
          minimumOrderAmount: editingPromotion.requirement.minimumOrderAmount || 0
        }
      });
    } else if (value === 'PAYMENT_TYPE') {
      setEditingPromotion({
        ...editingPromotion,
        requirement: {
          type: value,
          paymentType: editingPromotion.requirement.paymentType || 'PRE_PAID',
          minimumOrderAmount: editingPromotion.requirement.minimumOrderAmount || 0
        }
      });
    }
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  // Format promotion display text
  const formatPromotionText = (promotion: Promotion) => {
    let requirementText = '';
    
    if (promotion.requirement.type === 'AMOUNT') {
      requirementText = `Min. Order: ₹${promotion.requirement.minimumOrderAmount}`;
    } else if (promotion.requirement.type === 'PAYMENT_TYPE') {
      requirementText = `Payment: ${promotion.requirement.paymentType}, Min. Order: ₹${promotion.requirement.minimumOrderAmount}`;
    }
    
    let discountText = '';
    if (promotion.discount.type === 'PERCENTAGE') {
      discountText = `${promotion.discount.value}% off`;
      if (promotion.discount.maxDiscount > 0) {
        discountText += ` (up to ₹${promotion.discount.maxDiscount})`;
      } else if (promotion.discount.maxDiscount === -1) {
        discountText += ' (no cap)';
      }
    } else if (promotion.discount.type === 'FIXED') {
      discountText = `₹${promotion.discount.value} off`;
    }
    
    return { requirementText, discountText };
  };
  
  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Promotions Management
      </Typography>
      
     
      
      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {!isLoading && restaurantData && (
        <>
          {/* Restaurant Info */}
        
          
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Add Promotion" />
              <Tab label="View Promotions" />
            </Tabs>
          </Box>
          
          {/* Add Promotion Tab */}
          {tabValue === 0 && (
            <Box
              sx={{
                maxWidth: 600,
                mx: 'auto',
                p: 3,
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                backgroundColor: '#fff',
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
                Create New Promotion
              </Typography>
              
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Requirement
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Requirement Type</InputLabel>
                  <Select
                    value={newPromotion.requirement.type}
                    onChange={(e) => handleRequirementTypeChange(e.target.value)}
                    label="Requirement Type"
                  >
                    {REQUIREMENT_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type === 'AMOUNT' ? 'Minimum Order Amount' : 'Payment Type'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {newPromotion.requirement.type === 'PAYMENT_TYPE' && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Payment Type</InputLabel>
                    <Select
                      value={newPromotion.requirement.paymentType || ''}
                      onChange={(e) => handlePaymentTypeChange(e.target.value)}
                      label="Payment Type"
                    >
                      {PAYMENT_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type === 'PRE_PAID' ? 'PRE_PAID' : 'CASH_ON_DELIVERY'}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                
                <TextField
                  label="Minimum Order Amount"
                  type="number"
                  value={newPromotion.requirement.minimumOrderAmount}
                  onChange={(e) => handleMinimumOrderAmountChange(Number(e.target.value))}
                  fullWidth
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                  }}
                />
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Discount
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Discount Type</InputLabel>
                  <Select
                    value={newPromotion.discount.type}
                    onChange={(e) => handleDiscountTypeChange(e.target.value)}
                    label="Discount Type"
                  >
                    {DISCOUNT_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type === 'PERCENTAGE' ? 'Percentage Discount' : 'Fixed Amount Discount'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  label="Discount Value"
                  type="number"
                  value={newPromotion.discount.value}
                  onChange={(e) => handleDiscountValueChange(Number(e.target.value))}
                  fullWidth
                  sx={{ mb: 2 }}
                  InputProps={{
                    endAdornment: (
                      <Typography sx={{ ml: 1 }}>
                        {newPromotion.discount.type === 'PERCENTAGE' ? '%' : '₹'}
                      </Typography>
                    ),
                  }}
                />
                
                {newPromotion.discount.type === 'PERCENTAGE' && (
                  <TextField
                    label="Maximum Discount Amount (-1 for no cap)"
                    type="number"
                    value={newPromotion.discount.maxDiscount}
                    onChange={(e) => handleMaxDiscountChange(Number(e.target.value))}
                    fullWidth
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                    }}
                    helperText="Enter -1 for no maximum cap"
                  />
                )}
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={resetForm}
                  sx={{ flex: 1, textTransform: 'none', fontWeight: 600 }}
                >
                  Reset
                </Button>
                
                <Button
                  variant="contained"
                  onClick={addPromotion}
                  sx={{
                    flex: 1,
                    backgroundColor: '#2196f3',
                    color: '#fff',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: '#1976d2',
                    },
                  }}
                  startIcon={<AddIcon />}
                >
                  Add Promotion
                </Button>
              </Box>
            </Box>
          )}
          
          {/* View Promotions Tab */}
          {tabValue === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3, gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={savePromotions}
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
              
              {promotions?.length === 0 ? (
                <Box sx={{ textAlign: 'center', p: 4, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="body1" color="textSecondary">
                    No promotions available. Create your first promotion from the "Add Promotion" tab.
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {promotions?.map((promotion, index) => {
                    const { requirementText, discountText } = formatPromotionText(promotion);
                    
                    return (
                      <Grid item xs={12} md={6} key={index}>
                        <Card 
                          sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            transition: 'all 0.2s',
                            '&:hover': { 
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)' 
                            } 
                          }}
                        >
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                              <Chip 
                                label={promotion.requirement.type} 
                                size="small" 
                                sx={{ 
                                  bgcolor: '#e3f2fd', 
                                  color: '#0d47a1',
                                  fontWeight: 'bold' 
                                }} 
                              />
                              <Box>
                                <IconButton 
                                  size="small" 
                                  onClick={() => openEditDialog(index)}
                                  sx={{ mr: 1 }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  onClick={() => deletePromotion(index)}
                                  color="error"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                            
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 'bold', 
                                color: '#d32f2f', 
                                mb: 2 
                              }}
                            >
                              {discountText}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary">
                              {requirementText}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          )}
          
          {/* Edit Dialog */}
          <Dialog open={editDialogOpen} onClose={closeEditDialog} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Promotion</DialogTitle>
            <DialogContent>
              {editingPromotion && (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Requirement
                    </Typography>
                    
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Requirement Type</InputLabel>
                      <Select
                        value={editingPromotion.requirement.type}
                        onChange={(e) => handleEditRequirementTypeChange(e.target.value)}
                        label="Requirement Type"
                      >
                        {REQUIREMENT_TYPES.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type === 'AMOUNT' ? 'Minimum Order Amount' : 'Payment Type'}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    {editingPromotion.requirement.type === 'PAYMENT_TYPE' && (
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Payment Type</InputLabel>
                        <Select
                          value={editingPromotion.requirement.paymentType || ''}
                          onChange={(e) => setEditingPromotion({
                            ...editingPromotion,
                            requirement: {
                              ...editingPromotion.requirement,
                              paymentType: e.target.value
                            }
                          })}
                          label="Payment Type"
                        >
                          {PAYMENT_TYPES.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type === 'PRE_PAID' ? 'PRE_PAID' : 'CASH_ON_DELIVERY'}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                    
                    <TextField
                      label="Minimum Order Amount"
                      type="number"
                      value={editingPromotion.requirement.minimumOrderAmount}
                      onChange={(e) => setEditingPromotion({
                        ...editingPromotion,
                        requirement: {
                          ...editingPromotion.requirement,
                          minimumOrderAmount: Number(e.target.value)
                        }
                      })}
                      fullWidth
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                      }}
                    />
                  </Box>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Discount
                    </Typography>
                    
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Discount Type</InputLabel>
                      <Select
                        value={editingPromotion.discount.type}
                        onChange={(e) => setEditingPromotion({
                          ...editingPromotion,
                          discount: {
                            ...editingPromotion.discount,
                            type: e.target.value
                          }
                        })}
                        label="Discount Type"
                      >
                        {DISCOUNT_TYPES.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type === 'PERCENTAGE' ? 'Percentage Discount' : 'Fixed Amount Discount'}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <TextField
                      label="Discount Value"
                      type="number"
                      value={editingPromotion.discount.value}
                      onChange={(e) => setEditingPromotion({
                        ...editingPromotion,
                        discount: {
                          ...editingPromotion.discount,
                          value: Number(e.target.value)
                        }
                      })}
                      fullWidth
                      sx={{ mb: 2 }}
                      InputProps={{
                        endAdornment: (
                          <Typography sx={{ ml: 1 }}>
                            {editingPromotion.discount.type === 'PERCENTAGE' ? '%' : '₹'}
                          </Typography>
                        ),
                      }}
                    />
                    
                    {editingPromotion.discount.type === 'PERCENTAGE' && (
                      <TextField
                        label="Maximum Discount Amount (-1 for no cap)"
                        type="number"
                        value={editingPromotion.discount.maxDiscount}
                        onChange={(e) => setEditingPromotion({
                          ...editingPromotion,
                          discount: {
                            ...editingPromotion.discount,
                            maxDiscount: Number(e.target.value)
                          }
                        })}
                        fullWidth
                        InputProps={{
                          startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                        }}
                        helperText="Enter -1 for no maximum cap"
                      />
                    )}
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={closeEditDialog}>Cancel</Button>
              <Button onClick={saveEditedPromotion} variant="contained" color="primary">
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Offers;