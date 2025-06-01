import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  Modal,
  TextField,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { RazorpayOrderOptions, useRazorpay } from "react-razorpay";
import axiosInstance from '../../interceptor/axiosInstance';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

// Example transaction interface
interface Transaction {
  id: number;
  title: string;       // e.g. "Added to Wallet", "Sent to Rahul Rastogi", etc.
  date: string;        // e.g. "Jan 25th | 12:00 PM"
  amount: number;      // positive for add, negative for sent/refund
}

// Payment form interface
interface PaymentForm {
  amount: string;
  name: string;
  email: string;
  phone: string;
}

// Dummy data
const walletBalance = 4500;
const transactions: Transaction[] = [
  { id: 1, title: 'Added to Wallet', date: 'Jan 25th | 12:00 PM', amount: 500 },
  { id: 2, title: 'Sent to Rahul Rastogi', date: 'Jan 25th | 2:00 PM', amount: -450 },
  { id: 3, title: 'Added to Wallet', date: 'Jan 25th | 10:00 PM', amount: 750 },
  { id: 4, title: 'Refunded Back', date: 'Jan 25th | 2:00 PM', amount: 250 },
  { id: 5, title: 'Added to Wallet', date: 'Jan 25th | 10:00 PM', amount: 1400 },
];

const Wallet: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { userData } = useSelector((state: RootState) => state.auth);
  const { error, isLoading, Razorpay } = useRazorpay();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<PaymentForm>({
    amount: '',
    name: userData?.name || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState<Partial<PaymentForm>>({});

  const handleInputChange = (field: keyof PaymentForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<PaymentForm> = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Please enter a valid amount';
    }
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleModalSubmit = () => {
    if (validateForm()) {
      const amount = parseFloat(formData.amount);
      handlePayment(amount, formData.name, formData.email, formData.phone);
      setModalOpen(false);
    }
  };

  const handlePayment = async (amount: number, name: string, email: string, phone: string) => {
    try {
      const response = await axiosInstance.post('/rzp/create-order', {
        amount: amount,
        currency: "INR",
      });

      const options: RazorpayOrderOptions = {
        key: "rzp_test_JcjOC7WXfkQbdm",
        amount: amount * 100,
        currency: "INR",
        name: "OLF",
        description: "Test Transaction",
        order_id: response.data.data.id,
        handler: (response) => {
          console.log(response);
          alert("Payment Successful!");
        },
        prefill: {
          name: name,
          email: email,
          contact: phone,
        },
        theme: {
          color: "#F37254",
        },
      };

      const razorpayInstance = new Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment initialization failed.");
    }
  };

  const openModal = () => {
    // Reset form with user data if available
    setFormData({
      amount: '',
      name: userData?.name || '',
      email: userData?.email || '',
      phone: userData?.phone || '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormErrors({});
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: 'auto',
        p: { xs: 2, sm: 3 },
      }}
    >
      {/* Top bar: Wallet title and "Add Money" button/link */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Wallet
        </Typography>
        <Button
          variant="text"
          sx={{
            color: '#ff9800',
            fontWeight: 600,
            textTransform: 'none',
          }}
          onClick={openModal}
        >
          Add Money
        </Button>
      </Box>

      {/* Green Card for Wallet Balance */}
      <Box
        sx={{
          backgroundColor: '#4caf50',
          borderRadius: 2,
          color: '#fff',
          textAlign: 'center',
          py: 3,
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          ₹{walletBalance.toLocaleString('en-IN')}
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          Wallet Balance
        </Typography>
      </Box>

      {/* Latest Transactions heading */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Latest Transactions
      </Typography>

      {/* Transaction list */}
      <Stack spacing={2}>
        {transactions.map((tx) => {
          const isPositive = tx.amount >= 0;
          const displayAmount = `${isPositive ? '+' : '-'} ₹${Math.abs(tx.amount)}`;
          const amountColor = isPositive ? '#4caf50' : '#f44336';

          return (
            <Card
              key={tx.id}
              sx={{
                borderRadius: 2,
                backgroundColor: '#fff',
                boxShadow: 1,
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  flexDirection: { xs: 'column', sm: 'row' },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: { xs: 'flex-start', sm: 'flex-start' },
                    mb: { xs: 1, sm: 0 },
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {tx.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {tx.date}
                  </Typography>
                </Box>

                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: amountColor }}
                >
                  {displayAmount}
                </Typography>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {/* Payment Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 1,
        }}
      >
        <Box
          sx={{
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: 24,
            p: { xs: 3, sm: 4 },
            width: '100%',
            maxWidth: 400,
            maxHeight: '90vh',
            overflow: 'auto',
          }}
        >
          {/* Modal Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Add Money to Wallet
            </Typography>
            <IconButton onClick={closeModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Form Fields */}
          <Stack spacing={2.5}>
            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              error={!!formErrors.amount}
              helperText={formErrors.amount}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
              }}
            />

            <TextField
              label="Full Name"
              fullWidth
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={!!formErrors.name}
              helperText={formErrors.name}
            />

            <TextField
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={!!formErrors.email}
              helperText={formErrors.email}
            />

            <TextField
              label="Phone Number"
              fullWidth
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              error={!!formErrors.phone}
              helperText={formErrors.phone}
              inputProps={{
                maxLength: 10,
              }}
            />
          </Stack>

          {/* Action Buttons */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              mt: 3,
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <Button
              variant="outlined"
              fullWidth
              onClick={closeModal}
              sx={{
                textTransform: 'none',
                order: { xs: 2, sm: 1 },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={handleModalSubmit}
              disabled={isLoading}
              sx={{
                textTransform: 'none',
                backgroundColor: '#ff9800',
                '&:hover': {
                  backgroundColor: '#f57c00',
                },
                order: { xs: 1, sm: 2 },
              }}
            >
              {isLoading ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Wallet;