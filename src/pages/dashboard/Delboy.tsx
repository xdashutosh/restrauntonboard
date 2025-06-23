import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Rating,
  DialogActions,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Divider,
  Paper,
  Grid,
  Chip,
  InputAdornment,
  Alert,
  IconButton,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Phone as PhoneIcon,
  Event as EventIcon,
  LocalShipping as LocalShippingIcon,
  Close as CloseIcon,
  Description as DescriptionIcon,
  CreditCard as CreditCardIcon,
  PhotoCamera as PhotoCameraIcon,
  Person as PersonIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Search,
  FilterList,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Sort as SortIcon,
  People,
  Star,
  TrendingUp,
  Assignment,
  Edit,
  MoreVert,
  Schedule,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import axiosInstance from '../../interceptor/axiosInstance';
import { useToast } from '../../hooks/use-toast';

interface DeliveryBoy {
  del_id: string;
  name: string;
  phone: string;
  docs_exp: string;
  del_profile: string;
  total_del: number;
  rating: number;
  docs?: string;
  aadhar?: string;
}

interface Props {
  restdata: any;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'name' | 'rating' | 'deliveries' | 'expiry';
type FilterOption = 'all' | 'high-rating' | 'medium-rating' | 'low-rating' | 'expiring-soon';

const Delboy: React.FC<Props> = ({ restdata }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State variables
  const [openDialog, setOpenDialog] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [docs, setDocs] = useState('');
  const [docs_exp, setDocsExp] = useState('');
  const [aadhar, setAadhar] = useState<string>('');
  const [del_profile, setDelProfile] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageUploading, setImageUploading] = useState(false);
  const [delBoys, setDelBoys] = useState<DeliveryBoy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  // New state for desktop features
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Fetch delivery boys data
  useEffect(() => {
    const fetchData = async () => {
      if (!restdata?.outlet_id) return;
      
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/dels/?outlet_id=${restdata?.outlet_id}`);
        setDelBoys(res?.data?.data?.rows || []);
        setLoading(false);
        setError(null);
      } catch (error) {
        console.error("Error fetching delivery boys:", error);
        setError("Failed to load delivery personnel. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [restdata?.outlet_id]);

  // Filter and sort delivery boys
  const filteredDelBoys = delBoys.filter(boy => {
    const matchesSearch = searchQuery === "" || 
      boy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      boy.phone.includes(searchQuery);
    
    const isExpiringSoon = () => {
      const expDate = new Date(boy.docs_exp);
      const today = new Date();
      const diffTime = expDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    };
    
    const matchesFilter = filterOption === 'all' || 
      (filterOption === 'high-rating' && boy.rating >= 4.5) ||
      (filterOption === 'medium-rating' && boy.rating >= 3.5 && boy.rating < 4.5) ||
      (filterOption === 'low-rating' && boy.rating < 3.5) ||
      (filterOption === 'expiring-soon' && isExpiringSoon());
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        return b.rating - a.rating;
      case 'deliveries':
        return b.total_del - a.total_del;
      case 'expiry':
        return new Date(a.docs_exp).getTime() - new Date(b.docs_exp).getTime();
      default:
        return 0;
    }
  });

  // Calculate analytics
  const totalDeliveries = delBoys.reduce((acc, boy) => acc + boy.total_del, 0);
  const avgRating = delBoys.length > 0 
    ? delBoys.reduce((acc, boy) => acc + boy.rating, 0) / delBoys.length 
    : 0;
  const highRatingCount = delBoys.filter(boy => boy.rating >= 4.0).length;
  const expiringSoonCount = delBoys.filter(boy => {
    const expDate = new Date(boy.docs_exp);
    const today = new Date();
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }).length;

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: ViewMode | null,
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  // Convert file to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle image selection
  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    try {
      setImageUploading(true);
      const base64String = await convertToBase64(file);
      
      setSelectedImage(file);
      setImagePreview(base64String);
      setDelProfile(base64String);
      
      toast({
        title: "Image selected",
        description: "Profile image has been selected successfully",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error processing image",
        description: "Failed to process the selected image",
        variant: "destructive"
      });
    } finally {
      setImageUploading(false);
    }
  };

  // Handle image removal
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    setDelProfile('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!name.trim()) errors.name = "Name is required";
    
    if (!phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(phone)) {
      errors.phone = "Please enter a valid 10-digit phone number";
    }
    
    if (!docs_exp) errors.docs_exp = "Expiry date is required";
    
    if (!aadhar?.trim()) {
      errors.aadhar = "Aadhar number is required";
    } else if (!/^\d{12}$/.test(aadhar)) {
      errors.aadhar = "Please enter a valid 12-digit Aadhar number";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setFormErrors({});
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setDocs('');
    setDocsExp('');
    setAadhar('');
    setDelProfile('');
    setSelectedImage(null);
    setImagePreview('');
    setFormErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      await axiosInstance.post("/del", {
        name,
        phone,
        docs,
        docs_exp,
        aadhar,
        del_profile,
        "outlet_id": restdata?.outlet_id
      });
      
      // Refresh data after successful submission
      const res = await axiosInstance.get(`/dels/?outlet_id=${restdata?.outlet_id}`);
      setDelBoys(res?.data?.data?.rows || []);
      
      toast({
        title: "Success",
        description: "Delivery person added successfully",
        variant: "default"
      });
      
      handleCloseDialog();
    } catch (error: any) {
      toast({
        title: "Error adding delivery person",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Helper function for rating color
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return '#388e3c'; // High rating - green
    if (rating >= 3.5) return '#ff9800'; // Medium rating - orange
    return '#f44336'; // Low rating - red
  };

  // Check if document is expiring soon
  const isExpiringSoon = (dateString: string) => {
    const expDate = new Date(dateString);
    const today = new Date();
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  const DeliveryPersonCard = ({ boy }: { boy: DeliveryBoy }) => (
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
        {/* Header with avatar and basic info */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              boy.rating >= 4.5 ? (
                <CheckCircle sx={{ color: '#4caf50', fontSize: 16 }} />
              ) : isExpiringSoon(boy.docs_exp) ? (
                <Warning sx={{ color: '#ff9800', fontSize: 16 }} />
              ) : null
            }
          >
            <Avatar
              src={boy.del_profile}
              alt={boy.name}
              sx={{
                width: 64,
                height: 64,
                border: '3px solid',
                borderColor: getRatingColor(boy.rating),
              }}
            >
              {boy.name.charAt(0)}
            </Avatar>
          </Badge>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {boy.name}
            </Typography>
            
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
              <PhoneIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {boy.phone}
              </Typography>
            </Stack>
            
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <EventIcon fontSize="small" color="action" />
              <Typography 
                variant="body2" 
                color={isExpiringSoon(boy.docs_exp) ? 'warning.main' : 'text.secondary'}
                sx={{ fontWeight: isExpiringSoon(boy.docs_exp) ? 600 : 400 }}
              >
                Expires: {formatDate(boy.docs_exp)}
              </Typography>
            </Stack>
          </Box>
          
          <IconButton size="small">
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>

        {/* Stats section */}
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#E87C4E' }}>
                {boy.total_del}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Deliveries
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: getRatingColor(boy.rating) }}>
                {boy.rating.toFixed(1)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Rating
              </Typography>
            </Box>
          </Stack>
          
          {/* Rating stars */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Rating
              value={boy.rating}
              precision={0.5}
              readOnly
              size="small"
              sx={{
                '& .MuiRating-iconFilled': {
                  color: getRatingColor(boy.rating),
                }
              }}
            />
          </Box>
        </Box>

        {/* Status chips */}
        <Box sx={{ mt: 'auto' }}>
          <Stack direction="row" spacing={1} justifyContent="center">
            <Chip
              size="small"
              label={boy.rating >= 4.5 ? 'Top Performer' : boy.rating >= 3.5 ? 'Good' : 'Needs Improvement'}
              color={boy.rating >= 4.5 ? 'success' : boy.rating >= 3.5 ? 'primary' : 'warning'}
              variant="filled"
            />
            
            {isExpiringSoon(boy.docs_exp) && (
              <Chip
                size="small"
                label="Expiring Soon"
                color="warning"
                variant="outlined"
                icon={<Warning fontSize="small" />}
              />
            )}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );

  const DeliveryPersonListItem = ({ boy }: { boy: DeliveryBoy }) => (
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
        <Grid item xs={12} sm={4}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              src={boy.del_profile}
              alt={boy.name}
              sx={{
                width: 50,
                height: 50,
                border: '2px solid',
                borderColor: getRatingColor(boy.rating),
              }}
            >
              {boy.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {boy.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {boy.phone}
              </Typography>
            </Box>
          </Stack>
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalShippingIcon fontSize="small" color="action" />
              <Typography variant="body2">
                {boy.total_del} deliveries
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Star fontSize="small" sx={{ color: getRatingColor(boy.rating) }} />
              <Typography variant="body2">
                {boy.rating.toFixed(1)} rating
              </Typography>
            </Box>
          </Stack>
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <Typography 
            variant="body2" 
            color={isExpiringSoon(boy.docs_exp) ? 'warning.main' : 'text.secondary'}
            sx={{ fontWeight: isExpiringSoon(boy.docs_exp) ? 600 : 400 }}
          >
            Expires: {formatDate(boy.docs_exp)}
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={2}>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <IconButton size="small" color="primary">
              <Edit fontSize="small" />
            </IconButton>
            <IconButton size="small">
              <MoreVert fontSize="small" />
            </IconButton>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress color="warning" />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Section */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Delivery Personnel
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your delivery team and track their performance
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
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
          
          <Button
            variant="contained"
            onClick={handleOpenDialog}
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: theme.palette.warning.main,
              color: '#fff',
              '&:hover': {
                backgroundColor: theme.palette.warning.dark,
              },
            }}
          >
            Add Personnel
          </Button>
        </Stack>
      </Stack>

      {/* Analytics Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <People sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
              {delBoys.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Personnel
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <LocalShippingIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" color="success.main" sx={{ fontWeight: 600 }}>
              {totalDeliveries}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Deliveries
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
              Avg Rating
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Warning sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" color="warning.main" sx={{ fontWeight: 600 }}>
              {expiringSoonCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Expiring Soon
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Search and Filter Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <TextField
            fullWidth
            placeholder="Search by name or phone number..."
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
            <InputLabel>Filter</InputLabel>
            <Select
              value={filterOption}
              onChange={(e) => setFilterOption(e.target.value as FilterOption)}
              label="Filter"
              size="small"
            >
              <MenuItem value="all">All Personnel</MenuItem>
              <MenuItem value="high-rating">High Rating (4.5+)</MenuItem>
              <MenuItem value="medium-rating">Medium Rating (3.5+)</MenuItem>
              <MenuItem value="low-rating">Needs Improvement (&lt;3.5)</MenuItem>
              <MenuItem value="expiring-soon">Expiring Soon</MenuItem>
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
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="rating">Rating</MenuItem>
              <MenuItem value="deliveries">Deliveries</MenuItem>
              <MenuItem value="expiry">Expiry Date</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Showing {filteredDelBoys.length} of {delBoys.length} delivery personnel
        </Typography>
      </Paper>

      {/* Error message if any */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {error}
        </Alert>
      )}

      {/* Content */}
      {filteredDelBoys.length === 0 && !error ? (
        <Paper 
          sx={{ 
            p: 8, 
            textAlign: 'center', 
            borderRadius: 2
          }}
        >
          <People sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            {delBoys.length === 0 ? 'No delivery personnel added yet' : 'No personnel match your filters'}
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            {delBoys.length === 0 
              ? 'Add your first delivery person to get started'
              : 'Try adjusting your search or filter criteria'}
          </Typography>
          
          {delBoys.length === 0 ? (
            <Button
              variant="contained"
              onClick={handleOpenDialog}
              startIcon={<AddIcon />}
              sx={{
                backgroundColor: theme.palette.warning.main,
                '&:hover': { backgroundColor: theme.palette.warning.dark }
              }}
            >
              Add First Delivery Person
            </Button>
          ) : (
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
              {filteredDelBoys.map((boy) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={boy.del_id}>
                  <DeliveryPersonCard boy={boy} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Stack spacing={2}>
              {filteredDelBoys.map((boy) => (
                <DeliveryPersonListItem key={boy.del_id} boy={boy} />
              ))}
            </Stack>
          )}
        </>
      )}

      {/* Dialog for adding a new Delivery Boy */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2,
            padding: 1
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center' 
        }}>
          <Typography variant="h6" component="div">
            Add Delivery Personnel
          </Typography>
          <IconButton onClick={handleCloseDialog} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        
        <Divider />
        
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#E87C4E' }}>
                  Personal Information
                </Typography>
                
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    error={!!formErrors.phone}
                    helperText={formErrors.phone}
                    inputProps={{ maxLength: 10 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Aadhar Number"
                    value={aadhar}
                    onChange={(e) => setAadhar(e.target.value)}
                    error={!!formErrors.aadhar}
                    helperText={formErrors.aadhar}
                    inputProps={{ maxLength: 12 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CreditCardIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#E87C4E' }}>
                  Documents & Profile
                </Typography>
                
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Document ID"
                    value={docs}
                    onChange={(e) => setDocs(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescriptionIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    type="date"
                    label="Document Expiry Date"
                    value={docs_exp}
                    onChange={(e) => setDocsExp(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    error={!!formErrors.docs_exp}
                    helperText={formErrors.docs_exp}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EventIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  {/* Image Upload Section */}
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Profile Image
                    </Typography>
                    
                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    
                    {/* Image preview or upload button */}
                    {imagePreview ? (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        p: 2,
                        border: '2px dashed',
                        borderColor: theme.palette.warning.main,
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 152, 0, 0.04)'
                      }}>
                        <Avatar
                          src={imagePreview}
                          sx={{ width: 60, height: 60 }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" color="text.primary">
                            {selectedImage?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {selectedImage && `${(selectedImage.size / 1024 / 1024).toFixed(2)} MB`}
                          </Typography>
                        </Box>
                        <IconButton 
                          onClick={handleRemoveImage}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <Button
                        variant="outlined"
                        onClick={() => fileInputRef.current?.click()}
                        startIcon={imageUploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                        disabled={imageUploading}
                        fullWidth
                        sx={{
                          borderStyle: 'dashed',
                          borderWidth: 2,
                          borderColor: theme.palette.grey[300],
                          py: 2,
                          '&:hover': {
                            borderColor: theme.palette.warning.main,
                            backgroundColor: 'rgba(255, 152, 0, 0.04)'
                          }
                        }}
                      >
                        {imageUploading ? 'Processing...' : 'Choose Profile Image'}
                      </Button>
                    )}
                    
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Supported formats: JPG, PNG, GIF (Max 5MB)
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseDialog} 
            color="inherit"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            sx={{
              backgroundColor: theme.palette.warning.main,
              color: '#fff',
              '&:hover': {
                backgroundColor: theme.palette.warning.dark,
              },
              px: 3,
            }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Add Personnel'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Delboy;