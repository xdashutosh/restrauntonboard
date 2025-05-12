// OrderHistoryPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Stack,
  IconButton,
  CircularProgress,
  Divider,
  Paper,
  useMediaQuery,
  useTheme,
  Grid
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import TrainIcon from '@mui/icons-material/Train';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PaymentIcon from '@mui/icons-material/Payment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import axiosInstance from '../../interceptor/axiosInstance';
import { RootState } from '../../store/store';
import { useSelector } from 'react-redux';

interface MenuItem {
  name: string;
  item_id: number;
  quantity: number;
  descriptiom: string;
  SellingPrice: number;
  isVegetarian: boolean;
}

interface MenuItems {
  items: MenuItem[];
}

interface CustomerDetails {
  mobile: string;
  customerName: string;
  alternateMobile?: string;
}

interface CustomerInfo {
  customerDetails: CustomerDetails;
}

interface DeliveryDetails {
  deliveryDetails: {
    pnr: number;
    berth: string;
    coach: string;
    station: string;
    trainNo: string;
    stationCode: string;
    passengerCount: number;
  };
}

interface Order {
  oid: number;
  updated_at: string;
  pushed: number;
  updated_by: string;
  booked_from: string;
  menu_items: MenuItems;
  customer_info: CustomerInfo;
  mode: string;
  created_at: string;
  delivery_date: string;
  status: string;
  discount_amount: number | null;
  irctc_discount: number | null;
  vendor_discount: number | null;
  delivery_details: DeliveryDetails;
  comment: string;
  outlet_id: number;
  outlet_name: string;
  gst: string;
  fssai: string;
  phone: string;
  fssai_valid: string;
  address: string;
  city: string;
  state: string;
  rlname: string;
  rlphone: string;
  rlemail: string;
  station_name: string;
  station_code: string;
}

// Status mapping
const statusMap: Record<string, { text: string; color: string }> = {
  'ORDER_PREPARING': { text: 'Preparing', color: '#673ab7' }, // Purple for preparing
  'ORDER_DISPATCHED': { text: 'Dispatched', color: '#2196f3' }, // Blue for dispatched  
  'ORDER_DELIVERED': { text: 'Delivered', color: '#4caf50' }, // Green for delivered
  'ORDER_CANCELLED': { text: 'Cancelled', color: '#f44336' }, // Red for cancelled
};

// Payment mode mapping
const modeMap: Record<string, string> = {
  'CASH_ON_DELIVERY': 'Cash on Delivery',
  'ONLINE': 'Online Payment',
  'PREPAID': 'Prepaid',
  // Add more payment modes as needed
};

type FilterType = 'All' | 'Today' | 'Weekly' | 'DateRange';

const OrderHistory: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('All');
  const [openDateRangeDialog, setOpenDateRangeDialog] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  // Date range states
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // If a date range is applied, store it here (for display in chip)
  const [appliedDateRange, setAppliedDateRange] = useState<{
    from: string;
    to: string;
  } | null>(null);

  const outletid = useSelector((state: RootState) => state.outlet_id);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/orders/?outlet_id=${outletid?.outlet_id}`);
        if (response?.data?.data?.rows) {
          console.log('Sample order date:', response.data.data.rows[0]?.created_at);
          setOrders(response.data.data.rows);
        } else {
          setOrders([]);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [outletid]);

  const handleFilterChange = (filter: FilterType) => {
    setSelectedFilter(filter);
    // If user clicks on DateRange chip, open the dialog
    if (filter === 'DateRange') {
      setOpenDateRangeDialog(true);
    }
  };

  const handleApplyDateRange = () => {
    setAppliedDateRange({ from: fromDate, to: toDate });
    setOpenDateRangeDialog(false);
  };

  const handleCloseDateRangeDialog = () => {
    setOpenDateRangeDialog(false);
  };

  const toggleOrderExpand = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Parse date from the new format "DD-MM-YYYY HH:mm"
  const parseDate = (dateString: string): Date => {
    // Handle the format "DD-MM-YYYY HH:mm"
    const parts = dateString.split(' ');
    if (parts.length !== 2) {
      throw new Error('Invalid date format');
    }
    
    const [datePart] = parts;
    const [day, month, year] = datePart.split('-').map(Number);
    
    // Create date object - only use date part, set time to start of day
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const [datePart] = dateString.split(' ');
      return datePart; // Simply return the date part
    } catch (error) {
      console.error('Date parsing error:', error);
      return dateString.split(' ')[0]; // Fallback to just the date part
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    try {
      const [, timePart] = dateString.split(' ');
      const [hour, minute] = timePart.split(':').map(Number);
      
      // Convert to 12-hour format
      const period = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      
      return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      console.error('Time parsing error:', error);
      return dateString.split(' ')[1]; // Fallback to just the time part
    }
  };

 // Add this array of excluded statuses
const excludedStatuses = [
  'ORDER_PREPARING',
  'ORDER_PREPARED',
  'ORDER_OUT_FOR_DELIVERY',
  'ORDER_PARTIALLY_DELIVERED'
];

// Then modify the filteredOrders calculation
const filteredOrders = orders.filter((order) => {
  // First, check if the order has an excluded status
  if (excludedStatuses.includes(order.status)) {
    return false; // Skip this order if it has an excluded status
  }
  
  if (selectedFilter === 'All') {
    return true;
  }
  
  try {
    const orderDate = parseDate(order.created_at);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    if (selectedFilter === 'Today') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return orderDate >= today && orderDate < tomorrow;
    }
    
    if (selectedFilter === 'Weekly') {
      // Include today and go back 7 days
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      return orderDate >= sevenDaysAgo && orderDate < tomorrow;
    }
    
    if (selectedFilter === 'DateRange' && appliedDateRange) {
      // Parse the date string inputs from the date picker
      const fromDateObj = new Date(appliedDateRange.from);
      const toDateObj = new Date(appliedDateRange.to);
      
      // Set time to start of day for from date
      fromDateObj.setHours(0, 0, 0, 0);
      // Set time to end of day for to date
      toDateObj.setHours(23, 59, 59, 999);
      
      return orderDate >= fromDateObj && orderDate <= toDateObj;
    }
    
    return true;
  } catch (error) {
    console.error('Error filtering order:', order.oid, error);
    return true; // If date parsing fails, include the order
  }
});

  // Helper to render status chip with appropriate color
  const renderStatus = (status: string) => {
    const statusInfo = statusMap[status] || { text: status, color: '#9e9e9e' };
    
    return (
      <Chip
        label={statusInfo.text}
        size="small"
        sx={{
          backgroundColor: statusInfo.color,
          color: '#fff',
          fontWeight: 'bold',
          px: 1,
          height: 24
        }}
      />
    );
  };

  // Format menu items for display
  const formatMenuItems = (menuItems: MenuItems) => {
    return menuItems.items.map(item => 
      `${item.quantity} × ${item.name}`
    ).join(', ');
  };

  // Calculate total amount from menu items
  const calculateTotalAmount = (menuItems: MenuItems): number => {
    return menuItems.items.reduce((total, item) => {
      return total + (item.SellingPrice * item.quantity);
    }, 0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', minHeight: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography color="error" variant="h6" gutterBottom>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          sx={{ mt: 2, alignSelf: 'center' }}
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: isMobile ? 1 : 3, 
      maxWidth: '100%',
      margin: 'auto'
    }}>
      <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ mb: 2 }}>
        Order History
      </Typography>
      
      {/* Filter Chips */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 1.5, 
          mb: 3, 
          borderRadius: 2,
          backgroundColor: theme.palette.background.default,
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Chip
          label="All"
          color={selectedFilter === 'All' ? 'primary' : 'default'}
          onClick={() => handleFilterChange('All')}
          sx={{ minWidth: 80 }}
        />
        <Chip
          label="Today"
          color={selectedFilter === 'Today' ? 'primary' : 'default'}
          onClick={() => handleFilterChange('Today')}
          sx={{ minWidth: 80 }}
        />
        <Chip
          label="Last 7 Days"
          color={selectedFilter === 'Weekly' ? 'primary' : 'default'}
          onClick={() => handleFilterChange('Weekly')}
          sx={{ minWidth: 80 }}
        />
        <Chip
          icon={<CalendarMonthIcon />}
          label={
            appliedDateRange
              ? `${formatDate(appliedDateRange.from)} - ${formatDate(appliedDateRange.to)}`
              : 'Date Range'
          }
          color={selectedFilter === 'DateRange' ? 'primary' : 'default'}
          onClick={() => handleFilterChange('DateRange')}
        />
      </Paper>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          my: 4, 
          p: 3, 
          borderRadius: 2, 
          backgroundColor: theme.palette.background.paper,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="body1" color="text.secondary">
            No orders found for the selected filter
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {filteredOrders.map((order) => {
            const totalAmount = calculateTotalAmount(order.menu_items);
            
            return (
              <Card 
                key={order.oid} 
                sx={{ 
                  borderRadius: 2, 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
              >
                <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                  {/* Header Row */}
                  <Stack 
                    direction="row" 
                    justifyContent="space-between" 
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle1" fontWeight="bold">
                        #{order.oid}
                      </Typography>
                      {renderStatus(order.status)}
                    </Stack>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight="bold" 
                      color="primary"
                    >
                      ₹{totalAmount}
                    </Typography>
                  </Stack>

                  <Divider sx={{ my: 1 }} />
                  
                  {/* Order Items */}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: theme.palette.text.secondary,
                      mb: 1.5,
                      lineHeight: 1.5
                    }}
                  >
                    {formatMenuItems(order.menu_items)}
                  </Typography>
                  
                  {/* Date and Time */}
                  <Stack 
                    direction="row" 
                    spacing={2}
                    sx={{ mb: 1 }}
                    flexWrap="wrap"
                  >
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <CalendarMonthIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {formatDate(order.created_at)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {formatTime(order.created_at)}
                      </Typography>
                    </Stack>
                    {order.delivery_date && (
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <LocalShippingIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {formatDate(order.delivery_date)} {formatTime(order.delivery_date)}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                  
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mt: 1
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                    >
                      Payment: {modeMap[order.mode] || order.mode}
                    </Typography>
                    
                    <Button
                      endIcon={expandedOrderId === order.oid ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      onClick={() => toggleOrderExpand(order.oid)}
                      size="small"
                    >
                      {expandedOrderId === order.oid ? 'Less Details' : 'More Details'}
                    </Button>
                  </Box>
                  
                  {/* Expanded Details */}
                  {expandedOrderId === order.oid && (
                    <Box sx={{ mt: 2, pt: 1, borderTop: `1px dashed ${theme.palette.divider}` }}>
                      <Grid container spacing={2}>
                        {/* Customer Info */}
                        <Grid item xs={12} sm={6}>
                          <Stack spacing={1}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <PersonIcon fontSize="small" color="action" />
                              <Typography variant="body2">
                                {order.customer_info.customerDetails.customerName}
                              </Typography>
                            </Stack>
                            <Typography variant="body2" ml={3.5}>
                              {order.customer_info.customerDetails.mobile}
                            </Typography>
                            {order.customer_info.customerDetails.alternateMobile && (
                              <Typography variant="body2" ml={3.5}>
                                Alt: {order.customer_info.customerDetails.alternateMobile}
                              </Typography>
                            )}
                          </Stack>
                        </Grid>
                        
                        {/* Train Info */}
                        <Grid item xs={12} sm={6}>
                          <Stack spacing={1}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <TrainIcon fontSize="small" color="action" />
                              <Typography variant="body2">
                                Train #{order.delivery_details.deliveryDetails.trainNo}
                              </Typography>
                            </Stack>
                            <Typography variant="body2" ml={3.5}>
                              Coach: {order.delivery_details.deliveryDetails.coach}, Berth: {order.delivery_details.deliveryDetails.berth}
                            </Typography>
                            <Typography variant="body2" ml={3.5}>
                              PNR: {order.delivery_details.deliveryDetails.pnr}
                            </Typography>
                          </Stack>
                        </Grid>
                        
                        {/* Station */}
                        <Grid item xs={12}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <LocationOnIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {order.delivery_details.deliveryDetails.station} ({order.delivery_details.deliveryDetails.stationCode})
                            </Typography>
                          </Stack>
                        </Grid>
                        
                        {/* Additional Info */}
                        <Grid item xs={12}>
                          {order.comment && (
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              <strong>Comment:</strong> {order.comment}
                            </Typography>
                          )}
                          <Typography variant="body2">
                            <strong>Booked from:</strong> {order.booked_from}
                          </Typography>
                          {order.updated_by && (
                            <Typography variant="body2">
                              <strong>Updated by:</strong> {order.updated_by}
                            </Typography>
                          )}
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Date Range Dialog */}
      <Dialog 
        open={openDateRangeDialog} 
        onClose={handleCloseDateRangeDialog} 
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 2,
            padding: 1
          }
        }}
      >
        <DialogTitle>Select Date Range</DialogTitle>
        <DialogContent>
          <Stack direction="column" spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="From Date"
              type="date"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <TextField
              label="To Date"
              type="date"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDateRangeDialog} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleApplyDateRange} 
            variant="contained"
            disabled={!fromDate || !toDate}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderHistory;