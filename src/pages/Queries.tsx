import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Card,
  CardContent,
  Avatar,
  Stack,
  useMediaQuery,
  useTheme,
  Container,
  Paper,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Badge,
  IconButton,
  Divider,
  CardActions,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  ErrorOutline as ErrorOutlineIcon,
  Search,
  FilterList,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Sort as SortIcon,
  Support,
  Payment,
  Restaurant,
  LocalShipping,
  Priority as PriorityIcon,
  AccessTime,
  Chat,
  CheckCircle,
  Warning,
  Error,
  MoreVert,
  Reply,
  Archive,
  Flag
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Enhanced complaint item structure
interface Complaint {
  id: number;
  orderId: string;
  issue: string;
  imageUrl: string;
  customerName: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
  lastUpdated: string;
  category: 'quality' | 'payment' | 'delivery';
  description: string;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'priority' | 'status';
type FilterOption = 'all' | 'new' | 'in-progress' | 'resolved' | 'high-priority';

// Enhanced dummy data with more realistic information
const qualityIssues: Complaint[] = [
  {
    id: 1,
    orderId: '#ORD2024001',
    issue: 'Food quality was poor',
    description: 'The dal was too salty and the rice was undercooked. Also, the vegetables seemed stale.',
    imageUrl: 'https://via.placeholder.com/48x48?text=QI1',
    customerName: 'Priya Sharma',
    priority: 'high',
    status: 'new',
    createdAt: '2024-01-15T10:30:00Z',
    lastUpdated: '2024-01-15T10:30:00Z',
    category: 'quality'
  },
  {
    id: 2,
    orderId: '#ORD2024002',
    issue: 'Food was not properly cooked',
    description: 'The chicken in biryani was undercooked and the spice level was too high despite ordering mild.',
    imageUrl: 'https://via.placeholder.com/48x48?text=QI2',
    customerName: 'Rajesh Kumar',
    priority: 'urgent',
    status: 'in-progress',
    createdAt: '2024-01-14T14:15:00Z',
    lastUpdated: '2024-01-15T09:20:00Z',
    category: 'quality'
  },
  {
    id: 3,
    orderId: '#ORD2024003',
    issue: 'Wrong items delivered',
    description: 'Ordered paneer makhani but received dal makhani. Also missing the naan bread.',
    imageUrl: 'https://via.placeholder.com/48x48?text=QI3',
    customerName: 'Anita Verma',
    priority: 'medium',
    status: 'resolved',
    createdAt: '2024-01-13T16:45:00Z',
    lastUpdated: '2024-01-14T11:30:00Z',
    category: 'quality'
  }
];

const paymentIssues: Complaint[] = [
  {
    id: 4,
    orderId: '#ORD2024004',
    issue: 'Payment failed but amount deducted',
    description: 'Payment was deducted from my card but order status shows payment failed. Need immediate refund.',
    imageUrl: 'https://via.placeholder.com/48x48?text=PI1',
    customerName: 'Mohammed Ali',
    priority: 'urgent',
    status: 'new',
    createdAt: '2024-01-15T11:20:00Z',
    lastUpdated: '2024-01-15T11:20:00Z',
    category: 'payment'
  },
  {
    id: 5,
    orderId: '#ORD2024005',
    issue: 'Coupon discount not applied',
    description: 'Used coupon code SAVE20 but 20% discount was not applied to the bill.',
    imageUrl: 'https://via.placeholder.com/48x48?text=PI2',
    customerName: 'Sita Devi',
    priority: 'low',
    status: 'in-progress',
    createdAt: '2024-01-14T13:30:00Z',
    lastUpdated: '2024-01-15T08:45:00Z',
    category: 'payment'
  }
];

const deliveryIssues: Complaint[] = [
  {
    id: 6,
    orderId: '#ORD2024006',
    issue: 'Food delivered cold',
    description: 'Food was completely cold when delivered. Delivery took 2 hours despite 45 minute estimate.',
    imageUrl: 'https://via.placeholder.com/48x48?text=DI1',
    customerName: 'Vikram Singh',
    priority: 'high',
    status: 'new',
    createdAt: '2024-01-15T12:15:00Z',
    lastUpdated: '2024-01-15T12:15:00Z',
    category: 'delivery'
  },
  {
    id: 7,
    orderId: '#ORD2024007',
    issue: 'Delivery person rude behavior',
    description: 'Delivery person was very rude and did not follow delivery instructions.',
    imageUrl: 'https://via.placeholder.com/48x48?text=DI2',
    customerName: 'Lakshmi Nair',
    priority: 'medium',
    status: 'resolved',
    createdAt: '2024-01-13T19:30:00Z',
    lastUpdated: '2024-01-14T10:15:00Z',
    category: 'delivery'
  }
];

// Helper object to store all complaint categories
const complaintData = {
  quality: qualityIssues,
  payment: paymentIssues,
  delivery: deliveryIssues,
};

const Queries: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // State management
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Handle tab change
  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: ViewMode | null,
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  // Get current complaints based on selected tab
  const getCurrentComplaints = (): Complaint[] => {
    if (selectedTab === 0) return complaintData.quality;
    if (selectedTab === 1) return complaintData.payment;
    if (selectedTab === 2) return complaintData.delivery;
    return [];
  };

  // Get all complaints for analytics
  const allComplaints = [...qualityIssues, ...paymentIssues, ...deliveryIssues];

  // Filter and sort complaints
  const filteredComplaints = getCurrentComplaints().filter(complaint => {
    const matchesSearch = searchQuery === "" || 
      complaint.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterOption === 'all' || 
      (filterOption === 'new' && complaint.status === 'new') ||
      (filterOption === 'in-progress' && complaint.status === 'in-progress') ||
      (filterOption === 'resolved' && complaint.status === 'resolved') ||
      (filterOption === 'high-priority' && (complaint.priority === 'high' || complaint.priority === 'urgent'));
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'status':
        const statusOrder = { new: 4, 'in-progress': 3, resolved: 2, closed: 1 };
        return statusOrder[b.status] - statusOrder[a.status];
      default:
        return 0;
    }
  });

  // Calculate analytics
  const totalComplaints = allComplaints.length;
  const newComplaints = allComplaints.filter(c => c.status === 'new').length;
  const inProgressComplaints = allComplaints.filter(c => c.status === 'in-progress').length;
  const resolvedComplaints = allComplaints.filter(c => c.status === 'resolved').length;
  const urgentComplaints = allComplaints.filter(c => c.priority === 'urgent' || c.priority === 'high').length;

  // Helper functions
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#d32f2f';
      case 'high': return '#ff9800';
      case 'medium': return '#2196f3';
      case 'low': return '#4caf50';
      default: return '#757575';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return '#f44336';
      case 'in-progress': return '#ff9800';
      case 'resolved': return '#4caf50';
      case 'closed': return '#757575';
      default: return '#757575';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'quality': return <Restaurant />;
      case 'payment': return <Payment />;
      case 'delivery': return <LocalShipping />;
      default: return <Support />;
    }
  };

  const ComplaintCard = ({ complaint }: { complaint: Complaint }) => (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.3s ease',
        border: '1px solid #e0e0e0',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
          borderColor: '#E87C4E'
        }
      }}
      onClick={() => navigate(`/dashboard/chat/${complaint.id}`)}
    >
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Stack direction="row" spacing={1}>
            <Chip
              icon={getCategoryIcon(complaint.category)}
              label={complaint.category.charAt(0).toUpperCase() + complaint.category.slice(1)}
              size="small"
              sx={{ 
                bgcolor: 'rgba(233, 124, 78, 0.1)',
                color: '#E87C4E',
                fontWeight: 600
              }}
            />
            <Chip
              label={complaint.priority.toUpperCase()}
              size="small"
              sx={{ 
                bgcolor: getPriorityColor(complaint.priority),
                color: 'white',
                fontWeight: 600
              }}
            />
          </Stack>
          <IconButton size="small">
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>

        {/* Customer and Order Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: '#E87C4E', width: 40, height: 40 }}>
            {complaint.customerName.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {complaint.customerName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {complaint.orderId}
            </Typography>
          </Box>
        </Box>

        {/* Issue */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          {complaint.issue}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
          {complaint.description.length > 100 
            ? `${complaint.description.substring(0, 100)}...` 
            : complaint.description}
        </Typography>

        {/* Status and Time */}
        <Box sx={{ mt: 'auto' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Chip
              label={complaint.status.replace('-', ' ').toUpperCase()}
              size="small"
              sx={{ 
                bgcolor: getStatusColor(complaint.status),
                color: 'white',
                fontWeight: 600
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {formatTimeAgo(complaint.createdAt)}
            </Typography>
          </Stack>
        </Box>
      </CardContent>
      
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button size="small" startIcon={<Reply />} sx={{ mr: 1 }}>
          Reply
        </Button>
        <Button size="small" startIcon={<CheckCircle />} color="success">
          Resolve
        </Button>
      </CardActions>
    </Card>
  );

  const ComplaintListItem = ({ complaint }: { complaint: Complaint }) => (
    <Paper
      sx={{
        p: 3,
        transition: 'all 0.2s ease',
        border: '1px solid #e0e0e0',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 3,
          borderColor: '#E87C4E'
        }
      }}
      onClick={() => navigate(`/dashboard/chat/${complaint.id}`)}
    >
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} sm={4}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: '#E87C4E' }}>
              {complaint.customerName.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {complaint.customerName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {complaint.orderId}
              </Typography>
            </Box>
          </Stack>
        </Grid>
        
        <Grid item xs={12} sm={5}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {complaint.issue}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {complaint.description.length > 80 
              ? `${complaint.description.substring(0, 80)}...` 
              : complaint.description}
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <Stack spacing={1} alignItems="flex-end">
            <Stack direction="row" spacing={1}>
              <Chip
                label={complaint.priority.toUpperCase()}
                size="small"
                sx={{ 
                  bgcolor: getPriorityColor(complaint.priority),
                  color: 'white',
                  fontWeight: 600
                }}
              />
              <Chip
                label={complaint.status.replace('-', ' ').toUpperCase()}
                size="small"
                sx={{ 
                  bgcolor: getStatusColor(complaint.status),
                  color: 'white',
                  fontWeight: 600
                }}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {formatTimeAgo(complaint.createdAt)}
            </Typography>
          </Stack>
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
            Customer Queries & Complaints
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and resolve customer issues efficiently
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
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Support sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
              {totalComplaints}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Complaints
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Error sx={{ fontSize: 40, color: '#f44336', mb: 1 }} />
            <Typography variant="h4" color="#f44336" sx={{ fontWeight: 600 }}>
              {newComplaints}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              New Issues
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <AccessTime sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
            <Typography variant="h4" color="#ff9800" sx={{ fontWeight: 600 }}>
              {inProgressComplaints}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              In Progress
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
            <Typography variant="h4" color="#4caf50" sx={{ fontWeight: 600 }}>
              {resolvedComplaints}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Resolved
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Warning sx={{ fontSize: 40, color: '#d32f2f', mb: 1 }} />
            <Typography variant="h4" color="#d32f2f" sx={{ fontWeight: 600 }}>
              {urgentComplaints}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              High Priority
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Category Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              textTransform: 'none',
              minHeight: 64,
              px: 3
            },
          }}
        >
          <Tab
            icon={<Restaurant />}
            iconPosition="start"
            label={`Quality Issues (${complaintData.quality.length})`}
            id="quality-issues-tab"
          />
          <Tab
            icon={<Payment />}
            iconPosition="start"
            label={`Payment Issues (${complaintData.payment.length})`}
            id="payment-issues-tab"
          />
          <Tab
            icon={<LocalShipping />}
            iconPosition="start"
            label={`Delivery Issues (${complaintData.delivery.length})`}
            id="delivery-issues-tab"
          />
        </Tabs>
      </Paper>

      {/* Search and Filter Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <TextField
            fullWidth
            placeholder="Search by order ID, customer name, or issue description..."
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
            <InputLabel>Filter Status</InputLabel>
            <Select
              value={filterOption}
              onChange={(e) => setFilterOption(e.target.value as FilterOption)}
              label="Filter Status"
              size="small"
            >
              <MenuItem value="all">All Issues</MenuItem>
              <MenuItem value="new">New</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="high-priority">High Priority</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 130 }}>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              label="Sort by"
              size="small"
            >
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="oldest">Oldest</MenuItem>
              <MenuItem value="priority">Priority</MenuItem>
              <MenuItem value="status">Status</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Showing {filteredComplaints.length} of {getCurrentComplaints().length} complaints
        </Typography>
      </Paper>

      {/* Complaints List */}
      <Box>
        {filteredComplaints.length === 0 ? (
          <Paper sx={{ 
            textAlign: "center", 
            py: 8, 
            px: 2
          }}>
            <Support sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              {getCurrentComplaints().length === 0 ? 'No complaints in this category' : 'No complaints match your filters'}
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              {getCurrentComplaints().length === 0 
                ? 'Great! No customer issues to resolve in this category'
                : 'Try adjusting your search or filter criteria'}
            </Typography>
            
            {getCurrentComplaints().length > 0 && (
              <Button 
                variant="outlined" 
                onClick={() => {
                  setSearchQuery("");
                  setFilterOption("all");
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
                {filteredComplaints.map((complaint) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={complaint.id}>
                    <ComplaintCard complaint={complaint} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Stack spacing={2}>
                {filteredComplaints.map((complaint) => (
                  <ComplaintListItem key={complaint.id} complaint={complaint} />
                ))}
              </Stack>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default Queries;