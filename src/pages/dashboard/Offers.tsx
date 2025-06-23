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
  Chip,
  Container,
  Stack,
  InputAdornment,
  Collapse,
  useTheme,
  useMediaQuery,
  ToggleButton,
  ToggleButtonGroup,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Search,
  FilterList,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  LocalOffer,
  TrendingDown,
  Money,
  Campaign,
  CurrencyRupee,
  Percent,
  Payment,
  ShoppingCart,
  ExpandMore,
  ExpandLess,
  ContentCopy
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
  [key: string]: any;
}

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'percentage' | 'fixed' | 'amount' | 'payment';

const REQUIREMENT_TYPES = ['AMOUNT', 'PAYMENT_TYPE'];
const PAYMENT_TYPES = ['PRE_PAID', 'POST_PAID'];
const DISCOUNT_TYPES = ['PERCENTAGE', 'FIXED'];

const Offers: React.FC = () => {
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Restaurant data state
  const [restaurantData, setRestaurantData] = useState<RestaurantData | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [formExpanded, setFormExpanded] = useState(true);
  
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
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Fetch restaurant data
  const fetchRestaurantData = async() => {
    if (!outletid) return;
    
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/restraunts/?outlet_id=${outletid?.outlet_id}`);
      setRestaurantData(response?.data?.data?.rows[0]);
      setPromotions(response?.data?.data?.rows[0]?.promotions?.promotions || []);
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

  // Filter promotions based on search and filter type
  const filteredPromotions = promotions.filter(promotion => {
    const matchesSearch = searchQuery === "" || 
      promotion.requirement.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promotion.discount.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
      (filterType === 'percentage' && promotion.discount.type === 'PERCENTAGE') ||
      (filterType === 'fixed' && promotion.discount.type === 'FIXED') ||
      (filterType === 'amount' && promotion.requirement.type === 'AMOUNT') ||
      (filterType === 'payment' && promotion.requirement.type === 'PAYMENT_TYPE');
    
    return matchesSearch && matchesFilter;
  });

  // Calculate analytics
  const totalPromotions = promotions.length;
  const percentageDiscounts = promotions.filter(p => p.discount.type === 'PERCENTAGE').length;
  const fixedDiscounts = promotions.filter(p => p.discount.type === 'FIXED').length;
  const avgDiscountValue = promotions.length > 0 
    ? promotions.reduce((acc, p) => acc + p.discount.value, 0) / promotions.length 
    : 0;
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: ViewMode | null,
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
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
      await axiosInstance.put(`/restraunt/${outletid.outlet_id}`, {"promotions":{promotions},status:3});
      
      setSnackbar({
        open: true,
        message: 'Promotions saved successfully!',
        severity: 'success',
      });
      
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
  const deletePromotion = async(index: number) => {
    await axiosInstance.put(`/restraunt/${outletid.outlet_id}`,{promotions:null,status:3});
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

  const PromotionCard = ({ promotion, index }: { promotion: Promotion, index: number }) => {
    const { requirementText, discountText } = formatPromotionText(promotion);
    
    return (
      <Card 
        sx={{ 
          height: '100%', 
          transition: 'all 0.3s ease',
          border: '1px solid #e0e0e0',
          '&:hover': { 
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8],
            borderColor: '#E87C4E'
          } 
        }}
      >
        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Stack direction="row" spacing={1}>
              <Chip 
                label={promotion.requirement.type} 
                size="small" 
                icon={promotion.requirement.type === 'AMOUNT' ? <ShoppingCart /> : <Payment />}
                sx={{ 
                  bgcolor: '#e3f2fd', 
                  color: '#0d47a1',
                  fontWeight: 600 
                }} 
              />
              <Chip 
                label={promotion.discount.type} 
                size="small" 
                icon={promotion.discount.type === 'PERCENTAGE' ? <Percent /> : <CurrencyRupee />}
                sx={{ 
                  bgcolor: '#e8f5e9', 
                  color: '#2e7d32',
                  fontWeight: 600 
                }} 
              />
            </Stack>
            <Box>
              <IconButton 
                size="small" 
                onClick={() => openEditDialog(index)}
                sx={{ mr: 0.5 }}
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
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              color: '#E87C4E', 
              mb: 2,
              textAlign: 'center'
            }}
          >
            {discountText}
          </Typography>
          
          <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #f0f0f0' }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Requirement:</strong> {requirementText}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const PromotionListItem = ({ promotion, index }: { promotion: Promotion, index: number }) => {
    const { requirementText, discountText } = formatPromotionText(promotion);
    
    return (
      <Paper
        sx={{
          p: 3,
          transition: 'all 0.2s ease',
          border: '1px solid #e0e0e0',
          '&:hover': {
            boxShadow: 3,
            borderColor: '#E87C4E'
          }
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={1}>
            <Avatar sx={{ bgcolor: '#E87C4E' }}>
              <LocalOffer />
            </Avatar>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#E87C4E', mb: 1 }}>
              {discountText}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip 
                label={promotion.requirement.type} 
                size="small" 
                color="primary"
                variant="outlined"
              />
              <Chip 
                label={promotion.discount.type} 
                size="small" 
                color="secondary"
                variant="outlined"
              />
            </Stack>
          </Grid>
          
          <Grid item xs={12} sm={5}>
            <Typography variant="body2" color="text.secondary">
              {requirementText}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <IconButton 
                size="small" 
                onClick={() => openEditDialog(index)}
                color="primary"
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
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    );
  };
  
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Section */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Promotions & Offers
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create and manage discount offers for your customers
          </Typography>
        </Box>
        
        {!isMobile && tabValue === 1 && (
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
          >
            <ToggleButton value="grid">
              <ViewModuleIcon sx={{ mr: 1 }} />
              Cards
            </ToggleButton>
            <ToggleButton value="list">
              <ViewListIcon sx={{ mr: 1 }} />
              List
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      </Stack>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {!isLoading && restaurantData && (
        <>
          {/* Analytics Overview */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <LocalOffer sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
                  {totalPromotions}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Offers
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Percent sx={{ fontSize: 40, color: '#2e7d32', mb: 1 }} />
                <Typography variant="h4" color="#2e7d32" sx={{ fontWeight: 600 }}>
                  {percentageDiscounts}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Percentage Offers
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <CurrencyRupee sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
                <Typography variant="h4" color="#ff9800" sx={{ fontWeight: 600 }}>
                  {fixedDiscounts}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fixed Amount Offers
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <TrendingDown sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h4" color="info.main" sx={{ fontWeight: 600 }}>
                  {avgDiscountValue.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Discount Value
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Create Promotion" icon={<AddIcon />} />
              <Tab label="Manage Promotions" icon={<Campaign />} />
            </Tabs>
          </Box>
          
          {/* Add Promotion Tab */}
          {tabValue === 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Button
                onClick={() => setFormExpanded(!formExpanded)}
                endIcon={formExpanded ? <ExpandLess /> : <ExpandMore />}
                sx={{ mb: 2 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Create New Promotion
                </Typography>
              </Button>

              <Collapse in={formExpanded}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#E87C4E' }}>
                        Requirement Settings
                      </Typography>
                      
                      <FormControl fullWidth sx={{ mb: 3 }}>
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
                        <FormControl fullWidth sx={{ mb: 3 }}>
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
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                      />
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#E87C4E' }}>
                        Discount Settings
                      </Typography>
                      
                      <FormControl fullWidth sx={{ mb: 3 }}>
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
                        sx={{ mb: 3 }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              {newPromotion.discount.type === 'PERCENTAGE' ? '%' : '₹'}
                            </InputAdornment>
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
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          helperText="Enter -1 for no maximum cap"
                        />
                      )}
                    </Paper>
                  </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    onClick={resetForm}
                    sx={{ minWidth: 120 }}
                  >
                    Reset
                  </Button>
                  
                  <Button
                    variant="contained"
                    onClick={addPromotion}
                    sx={{
                      minWidth: 120,
                      backgroundColor: '#E87C4E',
                      '&:hover': {
                        backgroundColor: '#D26E2F',
                      },
                    }}
                    startIcon={<AddIcon />}
                  >
                    Add Promotion
                  </Button>
                </Box>
              </Collapse>
            </Paper>
          )}
          
          {/* View Promotions Tab */}
          {tabValue === 1 && (
            <Box>
              {/* Search and Filter Section */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                  <TextField
                    fullWidth
                    placeholder="Search promotions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      )
                    }}
                    sx={{ flex: 1 }}
                  />
                  
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Filter Type</InputLabel>
                    <Select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as FilterType)}
                      label="Filter Type"
                      size="small"
                    >
                      <MenuItem value="all">All Types</MenuItem>
                      <MenuItem value="percentage">Percentage</MenuItem>
                      <MenuItem value="fixed">Fixed Amount</MenuItem>
                      <MenuItem value="amount">Order Amount</MenuItem>
                      <MenuItem value="payment">Payment Type</MenuItem>
                    </Select>
                  </FormControl>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={savePromotions}
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    sx={{ minWidth: 140 }}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Showing {filteredPromotions.length} of {promotions.length} promotions
                </Typography>
              </Paper>
              
              {filteredPromotions?.length === 0 ? (
                <Paper sx={{ textAlign: 'center', p: 8 }}>
                  <LocalOffer sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    {promotions.length === 0 ? 'No promotions available' : 'No promotions match your filters'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" mb={3}>
                    {promotions.length === 0 
                      ? 'Create your first promotion to start offering discounts to customers'
                      : 'Try adjusting your search or filter criteria'}
                  </Typography>
                  
                  {promotions.length === 0 ? (
                    <Button 
                      variant="contained" 
                      onClick={() => setTabValue(0)}
                      startIcon={<AddIcon />}
                      sx={{
                        bgcolor: '#E87C4E',
                        '&:hover': { bgcolor: '#D26E2F' }
                      }}
                    >
                      Create First Promotion
                    </Button>
                  ) : (
                    <Button 
                      variant="outlined" 
                      onClick={() => {
                        setSearchQuery("");
                        setFilterType("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </Paper>
              ) : (
                <>
                  {viewMode === 'grid' ? (
                    <Grid container spacing={3}>
                      {filteredPromotions?.map((promotion, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <PromotionCard promotion={promotion} index={index} />
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Stack spacing={2}>
                      {filteredPromotions?.map((promotion, index) => (
                        <PromotionListItem key={index} promotion={promotion} index={index} />
                      ))}
                    </Stack>
                  )}
                </>
              )}
            </Box>
          )}
          
          {/* Edit Dialog */}
          <Dialog open={editDialogOpen} onClose={closeEditDialog} maxWidth="md" fullWidth>
            <DialogTitle>Edit Promotion</DialogTitle>
            <DialogContent>
              {editingPromotion && (
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
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
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
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
                            <InputAdornment position="end">
                              {editingPromotion.discount.type === 'PERCENTAGE' ? '%' : '₹'}
                            </InputAdornment>
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
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                          helperText="Enter -1 for no maximum cap"
                        />
                      )}
                    </Grid>
                  </Grid>
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
    </Container>
  );
};

export default Offers;