import React, { useState, useEffect } from 'react';
 // Import your existing axiosInstance
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,

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
  FormControlLabel,
  Switch
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import axiosInstance from '../../interceptor/axiosInstance';

const Offers: React.FC = () => {
  // Tab state
  const [tabValue, setTabValue] = useState(0);

  // Form state - only the required fields
  const [offerPercentage, setOfferPercentage] = useState<number | ''>('');
  const [offerCode, setOfferCode] = useState('');
  const [offerDesc, setOfferDesc] = useState('');
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);
  const [status, setStatus] = useState<number>(1);

  // Loading and error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Offers list
  const [offers, setOffers] = useState<any[]>([]);

  // Dialog state
  const [openPreview, setOpenPreview] = useState(false);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 1) {
      fetchOffers();
    }
  };

  // Fetch all offers
  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/offers');
      setOffers(response.data.data.rows || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load offers. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!offerPercentage || !offerCode || !offerDesc || !fromDate || !toDate) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const offerData = {
        offer_percentage: offerPercentage,
        offer_code: offerCode,
        offer_desc: offerDesc,
        valid_from: fromDate.format('YYYY-MM-DD'),
        valid_to: toDate.format('YYYY-MM-DD'),
        status: status
      };

      await axiosInstance.post('/offer', offerData);
      
      // Reset form
      resetForm();
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Offer created successfully!',
        severity: 'success'
      });
      
      // Refresh offers list
      if (tabValue === 1) {
        fetchOffers();
      }
    } catch (error) {
      console.error('Error creating offer:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create offer. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setOfferPercentage('');
    setOfferCode('');
    setOfferDesc('');
    setFromDate(null);
    setToDate(null);
    setStatus(1);
  };

  // Preview handlers


  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).format('MMM D, YYYY');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: '100%', p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Offers Management
        </Typography>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="offer management tabs">
            <Tab label="Create Offer" />
            <Tab label="View Offers" />
          </Tabs>
        </Box>

        {/* Create Offer Tab */}
        {tabValue === 0 && (
          <Box
            sx={{
              maxWidth: 500,
              mx: 'auto',
              p: 3,
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              backgroundColor: '#fff',
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Heading */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
              Create New Offer
            </Typography>

            {/* Offer Percentage */}
            <TextField
              label="Offer Percentage *"
              type="number"
              value={offerPercentage}
              onChange={(e) => setOfferPercentage(Number(e.target.value))}
              fullWidth
              required
              sx={{ mb: 2 }}
              inputProps={{ min: 0, max: 100 }}
            />

            {/* Offer Code */}
            <TextField
              label="Offer Code *"
              value={offerCode}
              onChange={(e) => setOfferCode(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <InputAdornment position="start">#</InputAdornment>,
              }}
            />

            {/* Offer Description */}
            <TextField
              label="Offer Description *"
              value={offerDesc}
              onChange={(e) => setOfferDesc(e.target.value)}
              placeholder="Describe the offer..."
              fullWidth
              required
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />

            {/* From Date */}
            <DatePicker
              label="From *"
              value={fromDate}
              onChange={(newValue) => setFromDate(newValue)}
              sx={{ width: '100%', mb: 2 }}
            />

            {/* To Date */}
            <DatePicker
              label="To *"
              value={toDate}
              onChange={(newValue) => setToDate(newValue)}
              sx={{ width: '100%', mb: 2 }}
              minDate={fromDate}
            />

            {/* Status Switch */}
            <FormControlLabel
              control={
                <Switch 
                  checked={status === 1}
                  onChange={(e) => setStatus(e.target.checked ? 1 : 0)}
                  color="primary"
                />
              }
              label="Active"
              sx={{ mb: 2 }}
            />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                onClick={resetForm}
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
                disabled={isSubmitting}
              >
                Reset
              </Button>

             

              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{
                  flex: 1,
                  backgroundColor: '#2196f3',
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#1976d2',
                  },
                }}
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
              >
                {isSubmitting ? 'Saving...' : 'Create'}
              </Button>
            </Box>
          </Box>
        )}

        {/* View Offers Tab */}
        {tabValue === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button 
                startIcon={<RefreshIcon />} 
                onClick={fetchOffers}
                disabled={isLoading}
              >
                Refresh
              </Button>
            </Box>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : offers.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 4, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="body1" color="textSecondary">
                  No offers available. Create your first offer from the "Create Offer" tab.
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ overflow: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell><strong>Code</strong></TableCell>
                      <TableCell><strong>Description</strong></TableCell>
                      <TableCell><strong>Percentage</strong></TableCell>
                      <TableCell><strong>Valid From</strong></TableCell>
                      <TableCell><strong>Valid To</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {offers.map((offer) => (
                      <TableRow key={offer.id} hover>
                        <TableCell sx={{ fontWeight: 'bold' }}>#{offer.offer_code}</TableCell>
                        <TableCell>{offer.offer_desc}</TableCell>
                        <TableCell>{offer.offer_percentage}%</TableCell>
                        <TableCell>{formatDate(offer.from)}</TableCell>
                        <TableCell>{formatDate(offer.to)}</TableCell>
                        <TableCell>
                          {offer.status === 1 ? (
                            <Box sx={{ 
                              display: 'inline-block',
                              bgcolor: '#e8f5e9', 
                              color: '#2e7d32',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.8rem',
                              fontWeight: 'bold'
                            }}>
                              Active
                            </Box>
                          ) : (
                            <Box sx={{ 
                              display: 'inline-block',
                              bgcolor: '#ffebee', 
                              color: '#c62828',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.8rem',
                              fontWeight: 'bold'
                            }}>
                              Inactive
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
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
      </Box>
    </LocalizationProvider>
  );
};

export default Offers;