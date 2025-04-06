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
import axiosInstance from '../../interceptor/axiosInstance';
import { RootState } from '../../store/store';
import { useSelector } from 'react-redux';

interface MenuItem {
  name: string;
  amount: number;
  dish_id: number;
  quantity: number;
}

interface MenuItems {
  items: MenuItem[];
}

interface Order {
  oid: number;
  cid: number;
  name: string;
  phone: string;
  trainnumber: number;
  trainname: string;
  res_id: number;
  outlet_name: string;
  station_id: number;
  station_name: string;
  menu_items: MenuItems;
  mode: number;
  amount: number;
  status: number;
  created_at: string;
  updated_at: string;
}

// Status mapping
const statusMap: Record<number, { text: string; color: string }> = {
  1: { text: 'Preparing', color: '#673ab7' }, // Purple for preparing
  2: { text: 'Order Dispatched', color: '#2196f3' }, // Blue for dispatched
  3: { text: 'Order Delivered', color: '#4caf50' }, // Green for delivered
  4: { text: 'Order Cancelled', color: '#f44336' }, // Red for cancelled
};

// Payment mode mapping
const modeMap: Record<number, string> = {
  1: 'Cash',
  2: 'Online',
  // Add more payment modes as needed
};

type FilterType = 'Today' | 'Weekly' | 'DateRange';

const OrderHistory: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('Today');
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

  const userData = useSelector((state: RootState) => state?.auth?.userData);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/restraunts/?vendor_id=${userData?.vendor_id}`);
        const restaurantRows = res?.data?.data?.rows;
        const response = await axiosInstance.get(`/orders/?res_id=${restaurantRows[0]?.res_id}`);
        if (response?.data?.data?.rows) {
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
  }, [userData?.vendor_id]);

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

  // Format date from ISO string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  // Format time from ISO string
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Filter orders based on selected filter
  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.created_at);
    const today = new Date();
    
    if (selectedFilter === 'Today') {
      return (
        orderDate.getDate() === today.getDate() &&
        orderDate.getMonth() === today.getMonth() &&
        orderDate.getFullYear() === today.getFullYear()
      );
    }
    
    if (selectedFilter === 'Weekly') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(today.getDate() - 7);
      return orderDate >= oneWeekAgo;
    }
    
    if (selectedFilter === 'DateRange' && appliedDateRange) {
      const fromDateObj = new Date(appliedDateRange.from);
      const toDateObj = new Date(appliedDateRange.to);
      // Set time to end of day for the to date to include the entire day
      toDateObj.setHours(23, 59, 59, 999);
      return orderDate >= fromDateObj && orderDate <= toDateObj;
    }
    
    return true;
  });

  // Helper to render status chip with appropriate color
  const renderStatus = (status: number) => {
    const statusInfo = statusMap[status] || { text: 'Unknown', color: '#9e9e9e' };
    
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
          label="Today"
          color={selectedFilter === 'Today' ? 'primary' : 'default'}
          onClick={() => handleFilterChange('Today')}
          sx={{ minWidth: 80 }}
        />
        <Chip
          label="Weekly"
          color={selectedFilter === 'Weekly' ? 'primary' : 'default'}
          onClick={() => handleFilterChange('Weekly')}
          sx={{ minWidth: 80 }}
        />
        <Chip
          icon={<CalendarMonthIcon />}
          label={
            appliedDateRange
              ? `${appliedDateRange.from} - ${appliedDateRange.to}`
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
          {filteredOrders.map((order) => (
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
                    ₹{order.amount}
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
                    Payment: {modeMap[order.mode] || 'Unknown'}
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
                              {order.name}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" ml={3.5}>
                            {order.phone}
                          </Typography>
                        </Stack>
                      </Grid>
                      
                      {/* Train Info */}
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={1}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <TrainIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {order.trainname}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" ml={3.5}>
                            Train #: {order.trainnumber}
                          </Typography>
                        </Stack>
                      </Grid>
                      
                      {/* Station */}
                      <Grid item xs={12}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LocationOnIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {order.station_name}
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
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