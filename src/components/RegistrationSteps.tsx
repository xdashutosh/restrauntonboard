import {
  Button,
  TextField,
  Stack,
  Typography,
  Drawer,
  CircularProgress,
  Box,
  Stepper,
  Step,
  StepLabel
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const dispatch = useDispatch();

  const toggleDrawer = (open: boolean) => {
    setDrawerOpen(open);
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
    toggleDrawer(true);
  };

  const handlelogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (loading) {
    return (
      <Stack justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack p={2}>
      <Box sx={{ width: '100%' }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && !vendorExists && (
          <Stack spacing={2}>
            <Typography variant="h5" sx={{ mb: 2 }}>Vendor Information</Typography>
            
            <TextField
              fullWidth
              label="Vendor Name"
              name="vendor_name"
              value={vendorForm.vendor_name}
              onChange={handleVendorChange}
            />
            
            <TextField
              fullWidth
              label="Vendor Phone"
              name="vendor_phone"
              value={vendorForm.vendor_phone}
              onChange={handleVendorChange}
              disabled // Since it comes from userData.mobile
            />
            
            <TextField
              fullWidth
              label="Vendor Email"
              name="vendor_email"
              value={vendorForm.vendor_email}
              onChange={handleVendorChange}
            />
            
            <TextField
              fullWidth
              label="Vendor Address"
              name="vendor_address"
              value={vendorForm.vendor_address}
              onChange={handleVendorChange}
              multiline
              rows={3}
            />
            
            <Button
              variant="contained"
              onClick={handleNextStep}
              sx={{ mt: 3, backgroundColor: '#FF6B3F' }}
            >
              Next
            </Button>
          </Stack>
        )}

        {activeStep === 1 && (
          <OutletRegistration
            vendorId={vendorId}
            onSubmit={handleOutletSubmit}
            onBack={handleBack}
            showBackButton={!vendorExists}
          />
        )}
      </Box>

      <Drawer
        anchor="bottom"
        open={drawerOpen}
        sx={{
          '& .MuiDrawer-paper': {
            height: '45vh',
            borderRadius: '50px 50px 0 0',
            bgcolor: '#FFF4F1',
          },
        }}
      >
        <Stack justifyContent={'center'} alignItems={'center'} height={'100%'} p={4} width={'100%'} textAlign={'center'}>
          <img src='https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRVKyAHIjNlFhGsr9sugvi1_4G868kL9yjR1nbh6SYQcICe2ZUc' height={150} width={150}/>
          <Typography fontFamily={"font-katibeh"} variant='h5'>Pending for Review</Typography>
          <Typography fontFamily={"font-katibeh"} color='gray'>You'll receive a mail once your details are reviewed by us.</Typography>
          <Button variant="contained" color="primary" fullWidth sx={{ mt: 4, p: 2, borderRadius: '12px', backgroundColor: '#FF6B3F', fontWeight: 'bolder' }} onClick={handlelogout}>
            Okay
          </Button>
        </Stack>
      </Drawer>
    </Stack>
  );
}