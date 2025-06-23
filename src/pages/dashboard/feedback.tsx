import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  MenuItem, 
  Select, 
  Divider, 
  Stack,
  Container,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Rating,
  LinearProgress,
  useTheme,
  useMediaQuery,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  IconButton
} from "@mui/material";
import { 
  Star, 
  TrendingUp,
  Reviews,
  ThumbUp,
  Schedule,
  Search,
  FilterList,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Sort as SortIcon,
  Restaurant,
  DeliveryDining,
  Comment,
  Assessment
} from "@mui/icons-material";

const feedbackData = {
  daily: [
    { orderId: "#1234567890", total: 278, items: "1 x Dal Makhni, 4 x Tandoori Roti", rating: 5.0, delivery: 4.5, comment: "The food was very delicious and the delivery time was also quick. I'll definitely try other dishes next time. Thanks!", date: "2024-01-15", customerName: "Priya Sharma" },
    { orderId: "#1234567891", total: 278, items: "1 x Aloo Gobhi, 4 x Tandoori Roti", rating: 4.0, delivery: 3.5, comment: "The food was very delicious and the delivery time was also quick. I'll definitely try other dishes next time. Thanks!", date: "2024-01-15", customerName: "Rajesh Kumar" }
  ],
  weekly: [
    { orderId: "#1234567892", total: 350, items: "2 x Butter Naan, 1 x Paneer Butter Masala", rating: 4.8, delivery: 4.0, comment: "Great taste and fast service!", date: "2024-01-14", customerName: "Anita Verma" },
    { orderId: "#1234567894", total: 420, items: "1 x Chicken Biryani, 2 x Naan", rating: 4.2, delivery: 4.5, comment: "Biryani was flavorful but could be less spicy.", date: "2024-01-13", customerName: "Mohammed Ali" },
    { orderId: "#1234567895", total: 180, items: "1 x Veg Thali", rating: 3.8, delivery: 3.0, comment: "Food was okay, delivery took longer than expected.", date: "2024-01-12", customerName: "Sita Devi" }
  ],
  monthly: [
    { orderId: "#1234567893", total: 420, items: "1 x Shahi Paneer, 3 x Tandoori Roti", rating: 4.2, delivery: 4.1, comment: "Good food, but delivery was a bit late.", date: "2024-01-10", customerName: "Vikram Singh" },
    { orderId: "#1234567896", total: 320, items: "2 x Dosa, 1 x Sambar", rating: 4.7, delivery: 4.8, comment: "Excellent South Indian food! Will order again.", date: "2024-01-08", customerName: "Lakshmi Nair" },
    { orderId: "#1234567897", total: 250, items: "1 x Pizza Margherita", rating: 3.5, delivery: 3.2, comment: "Pizza was cold when delivered.", date: "2024-01-05", customerName: "Amit Patel" }
  ]
};

type ViewMode = 'grid' | 'list';
type SortOption = 'date' | 'rating' | 'delivery' | 'total';

const Feedback = () => {
  const [selectedTab, setSelectedTab] = useState("monthly");
  const [dateRange, setDateRange] = useState("All Time");
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Get current feedback data
  const currentFeedback = feedbackData[selectedTab] || [];
  
  // Apply filters and search
  const filteredFeedback = currentFeedback.filter(feedback => {
    const matchesSearch = searchQuery === "" || 
      feedback.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.items.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRating = ratingFilter === "all" || 
      (ratingFilter === "5" && feedback.rating >= 4.5) ||
      (ratingFilter === "4" && feedback.rating >= 4.0 && feedback.rating < 4.5) ||
      (ratingFilter === "3" && feedback.rating >= 3.0 && feedback.rating < 4.0) ||
      (ratingFilter === "low" && feedback.rating < 3.0);
    
    return matchesSearch && matchesRating;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'delivery':
        return b.delivery - a.delivery;
      case 'total':
        return b.total - a.total;
      case 'date':
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  // Calculate analytics
  const avgRating = currentFeedback.length > 0 
    ? currentFeedback.reduce((acc, f) => acc + f.rating, 0) / currentFeedback.length 
    : 0;
  
  const avgDeliveryRating = currentFeedback.length > 0 
    ? currentFeedback.reduce((acc, f) => acc + f.delivery, 0) / currentFeedback.length 
    : 0;
  
  const highRatingCount = currentFeedback.filter(f => f.rating >= 4.0).length;
  const totalRevenue = currentFeedback.reduce((acc, f) => acc + f.total, 0);

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: ViewMode | null,
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const FeedbackCard = ({ feedback, index }: { feedback: any, index: number }) => (
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
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              {feedback.orderId}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#E87C4E' }}>
              ₹{feedback.total}
            </Typography>
          </Box>
          <Chip
            size="small"
            label={new Date(feedback.date).toLocaleDateString()}
            sx={{ bgcolor: 'rgba(233, 124, 78, 0.1)', color: '#E87C4E' }}
          />
        </Stack>

        {/* Customer Info */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Avatar sx={{ bgcolor: '#E87C4E', width: 40, height: 40 }}>
            {feedback.customerName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {feedback.customerName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Customer
            </Typography>
          </Box>
        </Stack>

        {/* Items */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          <strong>Items:</strong> {feedback.items}
        </Typography>

        {/* Ratings */}
        <Stack spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Food Quality
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Rating value={feedback.rating} readOnly size="small" />
                <Typography variant="body2" fontWeight={600}>
                  {feedback.rating.toFixed(1)}
                </Typography>
              </Stack>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={(feedback.rating / 5) * 100}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: '#f0f0f0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: feedback.rating >= 4 ? '#4caf50' : feedback.rating >= 3 ? '#ff9800' : '#f44336'
                }
              }}
            />
          </Box>

          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Delivery Service
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Rating value={feedback.delivery} readOnly size="small" />
                <Typography variant="body2" fontWeight={600}>
                  {feedback.delivery.toFixed(1)}
                </Typography>
              </Stack>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={(feedback.delivery / 5) * 100}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: '#f0f0f0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: feedback.delivery >= 4 ? '#4caf50' : feedback.delivery >= 3 ? '#ff9800' : '#f44336'
                }
              }}
            />
          </Box>
        </Stack>

        {/* Comment */}
        <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #f0f0f0' }}>
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#666' }}>
            "{feedback.comment}"
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  const FeedbackListItem = ({ feedback, index }: { feedback: any, index: number }) => (
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
        <Grid item xs={12} sm={3}>
          <Stack spacing={1}>
            <Typography variant="subtitle2" color="text.secondary">
              {feedback.orderId}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#E87C4E' }}>
              ₹{feedback.total}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(feedback.date).toLocaleDateString()}
            </Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Stack spacing={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {feedback.customerName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {feedback.items}
            </Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Restaurant fontSize="small" color="action" />
              <Rating value={feedback.rating} readOnly size="small" />
              <Typography variant="body2">{feedback.rating}</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <DeliveryDining fontSize="small" color="action" />
              <Rating value={feedback.delivery} readOnly size="small" />
              <Typography variant="body2">{feedback.delivery}</Typography>
            </Stack>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={2}>
          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
            "{feedback.comment.length > 50 ? feedback.comment.substring(0, 50) + '...' : feedback.comment}"
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Section */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Customer Feedback
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor customer satisfaction and improve your service
          </Typography>
        </Box>
        
        {!isMobile && (
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

      {/* Analytics Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Reviews sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
              {currentFeedback.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Reviews
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Star sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
            <Typography variant="h4" color="#ff9800" sx={{ fontWeight: 600 }}>
              {avgRating.toFixed(1)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg Food Rating
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <DeliveryDining sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" color="success.main" sx={{ fontWeight: 600 }}>
              {avgDeliveryRating.toFixed(1)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg Delivery Rating
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <ThumbUp sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
            <Typography variant="h4" color="info.main" sx={{ fontWeight: 600 }}>
              {Math.round((highRatingCount / currentFeedback.length) * 100) || 0}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Satisfaction Rate
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
            <TextField
              fullWidth
              placeholder="Search by order ID, customer, items, or comments..."
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
              <InputLabel size="small">Time Period</InputLabel>
              <Select
                value={selectedTab}
                onChange={(e) => setSelectedTab(e.target.value)}
                label="Time Period"
                size="small"
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 140 }}>
              <InputLabel size="small">Date Range</InputLabel>
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                label="Date Range"
                size="small"
              >
                <MenuItem value="All Time">All Time</MenuItem>
                <MenuItem value="Last 7 Days">Last 7 Days</MenuItem>
                <MenuItem value="Last 30 Days">Last 30 Days</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 130 }}>
              <InputLabel size="small">Rating Filter</InputLabel>
              <Select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                label="Rating Filter"
                size="small"
              >
                <MenuItem value="all">All Ratings</MenuItem>
                <MenuItem value="5">4.5+ Stars</MenuItem>
                <MenuItem value="4">4.0+ Stars</MenuItem>
                <MenuItem value="3">3.0+ Stars</MenuItem>
                <MenuItem value="low">Below 3.0</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel size="small">Sort by</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                label="Sort by"
                size="small"
              >
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="rating">Food Rating</MenuItem>
                <MenuItem value="delivery">Delivery Rating</MenuItem>
                <MenuItem value="total">Amount</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Showing {filteredFeedback.length} of {currentFeedback.length} reviews
          </Typography>
        </Stack>
      </Paper>

      {/* Feedback Display */}
      <Box>
        {filteredFeedback.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <Grid container spacing={3}>
                {filteredFeedback.map((feedback, index) => (
                  <Grid item xs={12} sm={6} md={4} key={feedback.orderId}>
                    <FeedbackCard feedback={feedback} index={index} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Stack spacing={2}>
                {filteredFeedback.map((feedback, index) => (
                  <FeedbackListItem key={feedback.orderId} feedback={feedback} index={index} />
                ))}
              </Stack>
            )}
          </>
        ) : (
          <Paper sx={{ 
            textAlign: "center", 
            py: 8, 
            px: 2
          }}>
            <Reviews sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No feedback found
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              {searchQuery || ratingFilter !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "No customer feedback available for the selected time period"}
            </Typography>
            
            {(searchQuery || ratingFilter !== "all") && (
              <Button 
                variant="outlined" 
                onClick={() => {
                  setSearchQuery("");
                  setRatingFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default Feedback;