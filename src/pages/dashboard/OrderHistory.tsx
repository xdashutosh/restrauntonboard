// OrderHistoryPage.tsx
import React, { useState } from 'react';
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
  Rating,
  IconButton
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import StarIcon from '@mui/icons-material/Star';

interface Order {
  id: string;
  items: string;
  status: 'Delivered' | 'Cancelled' | 'Ongoing';
  rating: number;
  date: string; // e.g. '15/02/2025'
  time: string; // e.g. '12:00 PM'
  total: number;
}

const mockOrders: Order[] = [
  {
    id: '#1234567890',
    items: '1 x Palak Paneer, 4 x Tandoori Roti',
    status: 'Delivered',
    rating: 4.5,
    date: '15/02/2025',
    time: '12:00 PM',
    total: 278,
  },
  {
    id: '#1234567890',
    items: '1 x Shahi Paneer, 4 x Tandoori Roti',
    status: 'Cancelled',
    rating: 3.5,
    date: '15/02/2025',
    time: '12:00 PM',
    total: 399,
  },
  {
    id: '#1234567890',
    items: '1 x Paneer Butter Masala, 2 x Naan',
    status: 'Ongoing',
    rating: 4.0,
    date: '16/02/2025',
    time: '01:30 PM',
    total: 320,
  },
  // Add more mock orders as needed
];

type FilterType = 'Today' | 'Weekly' | 'DateRange';

const OrderHistory: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('Today');
  const [openDateRangeDialog, setOpenDateRangeDialog] = useState(false);

  // Date range states
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // If a date range is applied, store it here (for display in chip)
  const [appliedDateRange, setAppliedDateRange] = useState<{
    from: string;
    to: string;
  } | null>(null);

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
    // If user closes without applying, revert to last known or revert filter
    setOpenDateRangeDialog(false);
    // Optionally revert to the old date range or set the filter to something else
  };

  // Filter logic: you can refine based on your date format, etc.
  // For now, let's just pretend we're filtering by the string in date (not recommended for real apps).
  const filteredOrders = mockOrders.filter((order) => {
    if (selectedFilter === 'Today') {
      // Example: if today's date is '15/02/2025'
      return order.date === '15/02/2025';
    }
    if (selectedFilter === 'Weekly') {
      // Example: Hard-code or compare to a week range
      // For demonstration, let's just allow all for weekly
      return true;
    }
    if (selectedFilter === 'DateRange' && appliedDateRange) {
      // In real scenario, parse fromDate and toDate properly and compare
      return (
        order.date >= appliedDateRange.from && order.date <= appliedDateRange.to
      );
    }
    return true; // default
  });

  // Helper to render status in different colors
  const renderStatus = (status: Order['status']) => {
    let color = '#4caf50'; // green by default for Delivered
    if (status === 'Cancelled') color = '#f44336'; // red
    if (status === 'Ongoing') color = '#ff9800'; // orange
    return (
      <Chip
        label={status}
        size="small"
        sx={{
          backgroundColor: color,
          color: '#fff',
          fontWeight: 'bold',
        }}
      />
    );
  };

  return (
    <Box sx={{ p: 2, maxWidth: 600, margin: 'auto' }}>
      {/* Filter Chips */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }} justifyContent="center">
        <Chip
          label="Today"
          variant={selectedFilter === 'Today' ? 'filled' : 'outlined'}
          onClick={() => handleFilterChange('Today')}
        />
        <Chip
          label="Weekly"
          variant={selectedFilter === 'Weekly' ? 'filled' : 'outlined'}
          onClick={() => handleFilterChange('Weekly')}
        />
        {/* If date range is applied, show the selected range, otherwise show "Date Range" */}
        <Chip
          icon={<CalendarMonthIcon />}
          label={
            appliedDateRange
              ? `${appliedDateRange.from} - ${appliedDateRange.to}`
              : 'Date Range'
          }
          variant={selectedFilter === 'DateRange' ? 'filled' : 'outlined'}
          onClick={() => handleFilterChange('DateRange')}
        />
      </Stack>

      {/* Orders List */}
      <Stack spacing={2}>
        {filteredOrders.map((order, index) => (
          <Card key={index} sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle2" fontWeight="bold">
                  Order ID: {order.id}
                </Typography>
                {renderStatus(order.status)}
              </Stack>
              <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                {order.items}
              </Typography>

              {/* Rating and date/time row */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mt: 1 }}
              >
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Rating
                    name="read-only"
                    value={order.rating}
                    readOnly
                    precision={0.5}
                    icon={<StarIcon fontSize="inherit" />}
                    emptyIcon={<StarIcon fontSize="inherit" sx={{ opacity: 0.3 }} />}
                  />
                  <Typography variant="body2" sx={{ ml: 0.5 }}>
                    {order.rating}
                  </Typography>
                </Stack>

                <Typography variant="body2">
                  Bill Total: ₹{order.total}
                </Typography>
              </Stack>

              {/* Date and Time */}
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                justifyContent="space-between"
                sx={{ mt: 1 }}
              >
                <Typography variant="caption">
                  Date: {order.date}
                </Typography>
                <Typography variant="caption">
                  Time: {order.time}
                </Typography>
              </Stack>

              {/* View Train Details */}
              <Box sx={{ mt: 1 }}>
                <Button variant="text" color="primary">
                  View Train Details
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Date Range Dialog */}
      <Dialog open={openDateRangeDialog} onClose={handleCloseDateRangeDialog} fullWidth>
        <DialogTitle>Select Date Range</DialogTitle>
        <DialogContent>
          <Stack direction="column" spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="From (DD/MM/YYYY)"
              variant="outlined"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <TextField
              label="To (DD/MM/YYYY)"
              variant="outlined"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDateRangeDialog}>Cancel</Button>
          <Button onClick={handleApplyDateRange} variant="contained">
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderHistory;
