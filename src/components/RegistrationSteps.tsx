import {
  Button,
  TextField,
  Stack,
  Typography,
  CircularProgress,
  Box,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Container,
  Dialog,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { useEffect, useState } from 'react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../interceptor/axiosInstance';
import { RootState } from '../store/store';
import OutletRegistration from './OutletRegistration';

const steps = ['Vendor Information', 'Outlet Details'];

export default function RegistrationForm() {
  const userData = useSelector((state: RootState) => state.auth.userData);
  const [activeStep, setActiveStep] = useState(0);
  const [vendorExists, setVendorExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState<string | number>('');
  
  // Vendor form state
  const [vendorForm, setVendorForm] = useState({
    vendor_name: '',
    vendor_phone: userData?.mobile || '',
    vendor_email: '',
    vendor_address: ''
  });

  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const dispatch = useDispatch();
  const [vendordata, setvendordata] = useState(null);

  const toggleDialog = (open: boolean) => {
    setDialogOpen(open);
  };

  // Check if vendor exists on mount
  useEffect(() => {
    const checkVendorExists = async () => {
      if (!userData?.mobile) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await axiosInstance.get(`/rest-vendor`, {
          params: { vendor_phone: userData.mobile }
        });
        
        if (response?.data?.data?.rows?.length > 0) {
          setVendorExists(true);
          const vendorData = response.data.data.rows[0];
          setvendordata(vendorData)
          const vendorId = vendorData.vendor_id;

          
          // Check if outlets already exist for this vendor
          const outletsResponse = await axiosInstance.get(`/restraunts`, {
            params: { vendor_id: vendorId }
          });
          
          if (outletsResponse?.data?.data?.rows?.length > 0) {
            // Outlets already exist, navigate to outlets page
            navigate(`/outlets/${vendorId}`);
            return;
          }
          
          // No outlets exist, proceed to outlet registration
          setActiveStep(1);
          setVendorId(vendorId);
        }
      } catch (error) {
        console.error('Error checking vendor existence:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkVendorExists();
  }, [userData, navigate]);

  // Handle vendor form changes
  const handleVendorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVendorForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle vendor registration and moving to next step
  const handleNextStep = async () => {
    if (activeStep === 0) {
      try {
        // Register vendor
        const response = await axiosInstance.post('/rest-vendor', vendorForm);
        
        if (response?.data) {
          console.log(response?.data?.data?.rows[0].id)
          // Update vendor_id
          const vendorId = response?.data?.data?.rows[0].id;
          setVendorId(vendorId);
          setActiveStep(1);
        }
      } catch (error) {
        console.error('Error registering vendor:', error);
        // Handle error appropriately
      }
    }
  };

  // Handle back button
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  // Handle successful outlet submission
  const handleOutletSubmit = () => {
    toggleDialog(true);
  };

  const handlelogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{ backgroundColor: '#f5f5f5' }}
      >
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Stack alignItems="center" spacing={2}>
            <CircularProgress size={60} sx={{ color: '#FF6B3F' }} />
            <Typography variant="h6" color="text.secondary">
              Loading...
            </Typography>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          {/* Header */}
          <Box sx={{ backgroundColor: '#FF6B3F', color: 'white', p: 3, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight="bold">
              Vendor Registration
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9, mt: 1 }}>
              Complete your registration to get started
            </Typography>
          </Box>

          <Box sx={{ p: 4 }}>
            {/* Stepper */}
            <Stepper activeStep={activeStep} sx={{ mb: 6 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel 
                    sx={{
                      '& .MuiStepLabel-label': {
                        fontSize: '1.1rem',
                        fontWeight: 500
                      }
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Vendor Information Form */}
            {activeStep === 0 && !vendorExists && (
              <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ mb: 3, color: '#FF6B3F', fontWeight: 600 }}>
                    Vendor Information
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Vendor Name"
                        name="vendor_name"
                        value={vendorForm.vendor_name}
                        onChange={handleVendorChange}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: '#FF6B3F',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#FF6B3F',
                            },
                          },
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Vendor Phone"
                        name="vendor_phone"
                        value={vendorForm.vendor_phone}
                        onChange={handleVendorChange}
                        disabled
                        variant="outlined"
                        helperText="Phone number from your account"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Vendor Email"
                        name="vendor_email"
                        type="email"
                        value={vendorForm.vendor_email}
                        onChange={handleVendorChange}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: '#FF6B3F',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#FF6B3F',
                            },
                          },
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Vendor Address"
                        name="vendor_address"
                        value={vendorForm.vendor_address}
                        onChange={handleVendorChange}
                        multiline
                        rows={4}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: '#FF6B3F',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#FF6B3F',
                            },
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                    <Button
                      variant="contained"
                      onClick={handleNextStep}
                      size="large"
                      sx={{ 
                        backgroundColor: '#FF6B3F',
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: '#e55a36',
                        }
                      }}
                    >
                      Continue to Outlet Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Outlet Registration */}
            {activeStep === 1 && (
              <OutletRegistration
                vendorId={vendorId}
                onSubmit={handleOutletSubmit}
                onBack={handleBack}
                showBackButton={!vendorExists}
                vendordata={vendordata}
              />
            )}
          </Box>
        </Paper>
      </Container>

      {/* Success Dialog - Replaced Drawer */}
      <Dialog
        open={dialogOpen}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: '#FFF4F1',
          }
        }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 6 }}>
          <Box sx={{ mb: 3 }}>
            <img 
              src='https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRVKyAHIjNlFhGsr9sugvi1_4G868kL9yjR1nbh6SYQcICe2ZUc' 
              height={120} 
              width={120}
              style={{ borderRadius: '50%' }}
            />
          </Box>
          
          <Typography 
            variant="h4" 
            fontFamily="font-katibeh" 
            sx={{ color: '#FF6B3F', fontWeight: 'bold', mb: 2 }}
          >
            Pending for Review
          </Typography>
          
          <Typography 
            variant="h6" 
            fontFamily="font-katibeh" 
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}
          >
            Thank you for registering! You'll receive an email once your details are reviewed by our team.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            variant="contained" 
            fullWidth
            size="large"
            onClick={handlelogout}
            sx={{ 
              py: 1.5, 
              borderRadius: 2, 
              backgroundColor: '#FF6B3F', 
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#e55a36',
              }
            }}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}