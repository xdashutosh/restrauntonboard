import React, { useEffect, useState } from 'react';
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
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PhoneIcon from '@mui/icons-material/Phone';
import EventIcon from '@mui/icons-material/Event';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PersonIcon from '@mui/icons-material/Person';
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
}

interface Props {
  restdata: any;
}

const Delboy: React.FC<Props> = ({ restdata }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { toast } = useToast();

  // State variables
  const [openDialog, setOpenDialog] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [docs, setDocs] = useState('');
  const [docs_exp, setDocsExp] = useState('');
  const [aadhar, setAadhar] = useState<string>('');
  const [del_profile, setDelProfile] = useState('');
  const [delBoys, setDelBoys] = useState<DeliveryBoy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Fetch delivery boys data
  useEffect(() => {
    const fetchData = async () => {
      if (!restdata?.res_id) return;
      
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/dels/?res_id=${restdata?.res_id}`);
        setDelBoys(res?.data?.data?.rows || []);
        setError(null);
      } catch (error) {
        console.error("Error fetching delivery boys:", error);
        setError("Failed to load delivery personnel. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [restdata]);

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
    setFormErrors({});
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
        "res_id": restdata?.res_id
      });
      
      // Refresh data after successful submission
      const res = await axiosInstance.get(`/dels/?res_id=${restdata?.res_id}`);
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

  if (loading && delBoys.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress color="warning" />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: 800, 
      mx: 'auto', 
      p: isMobile ? 1.5 : 3,
      width: '100%' 
    }}>
      {/* Header with title and add button */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: isMobile ? 1.5 : 2, 
          mb: 3, 
          borderRadius: 2,
          backgroundColor: theme.palette.background.default,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant={isMobile ? "h6" : "h5"} fontWeight="600" color="text.primary">
            Delivery Personnel
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {delBoys.length} active delivery {delBoys.length === 1 ? 'person' : 'people'}
          </Typography>
        </Box>
        
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
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            px: isMobile ? 2 : 3,
          }}
        >
          {isMobile ? 'Add' : 'Add Person'}
        </Button>
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

      {/* Empty state */}
      {!loading && delBoys.length === 0 && !error && (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
            mb: 2
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No delivery personnel added yet
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Add your first delivery person to get started
          </Typography>
          <Button
            variant="outlined"
            onClick={handleOpenDialog}
            startIcon={<AddIcon />}
            color="warning"
          >
            Add Delivery Person
          </Button>
        </Paper>
      )}

      {/* List of Delivery Boys */}
      <Stack spacing={2}>
        {delBoys.map((boy) => (
          <Card
            key={boy.del_id}
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              },
            }}
          >
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Grid container spacing={2} alignItems="center">
                {/* Avatar and Name section */}
                <Grid item xs={12} sm={7} md={8} container alignItems="center" spacing={2}>
                  <Grid item>
                    <Avatar
                      src={boy.del_profile}
                      alt={boy.name}
                      sx={{
                        width: 56,
                        height: 56,
                        border: '2px solid',
                        borderColor: getRatingColor(boy.rating),
                      }}
                    >
                      {boy.name.charAt(0)}
                    </Avatar>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {boy.name}
                    </Typography>
                    
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">{boy.phone}</Typography>
                    </Stack>
                    
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                      <EventIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        Expires: {formatDate(boy.docs_exp)}
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>

                {/* Stats and Rating section */}
                <Grid item xs={12} sm={5} md={4}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: isMobile ? 'flex-start' : 'flex-end', 
                    gap: 1 
                  }}>
                    <Chip
                      icon={<LocalShippingIcon />}
                      label={`${boy.total_del} Deliveries`}
                      variant="outlined"
                      size="small"
                      sx={{ 
                        borderRadius: '16px',
                        fontWeight: 500,
                      }}
                    />
                    
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        borderRadius: '16px',
                        padding: '4px 10px',
                      }}
                    >
                      <Rating
                        name={`rating-${boy.del_id}`}
                        value={boy.rating}
                        precision={0.5}
                        readOnly
                        size="small"
                        sx={{ 
                          mr: 1, 
                          '& .MuiRating-iconFilled': {
                            color: getRatingColor(boy.rating),
                          }
                        }}
                      />
                      <Typography 
                        variant="body2" 
                        fontWeight="600" 
                        sx={{ color: getRatingColor(boy.rating) }}
                      >
                        {boy.rating.toFixed(1)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Dialog for adding a new Delivery Boy */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
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
            Onboard Delivery Person
          </Typography>
          <IconButton onClick={handleCloseDialog} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        
        <Divider />
        
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
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
            </Grid>
            
            <Grid item xs={12}>
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
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Pass Document ID"
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
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Pass Expiry Date"
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
            </Grid>
            
            <Grid item xs={12} sm={6}>
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
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Profile Image URL"
                placeholder="https://example.com/image.jpg"
                value={del_profile}
                onChange={(e) => setDelProfile(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhotoCameraIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseDialog} 
            color="inherit"
            variant="outlined"
            sx={{ borderRadius: 1 }}
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
              borderRadius: 1,
              px: 3,
            }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Delboy;