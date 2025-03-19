import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Switch,
  Button,
  InputAdornment,
  Dialog,
  DialogContent,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';

const Offers: React.FC = () => {
  // Form state
  const [offerUrl, setOfferUrl] = useState('');
  const [offerCategory, setOfferCategory] = useState('');
  const [discountType, setDiscountType] = useState('');
  const [offerPercentage, setOfferPercentage] = useState<number | ''>('');
  const [offerCode, setOfferCode] = useState('');
  const [offerDesc, setOfferDesc] = useState('');
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);
  const [offerActive, setOfferActive] = useState(false);

  // Dialog state
  const [openPreview, setOpenPreview] = useState(false);

  const handlePreview = () => {
    // You could add validation or other logic here
    setOpenPreview(true);
  };

  const handleClosePreview = () => {
    setOpenPreview(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
          Manage Offers
        </Typography>

        {/* Offer URL */}
        <TextField
          label="Offer URL"
          value={offerUrl}
          onChange={(e) => setOfferUrl(e.target.value)}
          placeholder="Paste banner link here"
          fullWidth
          sx={{ mb: 2 }}
        />

        {/* Offer Category */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Offer Category</InputLabel>
          <Select
            value={offerCategory}
            onChange={(e) => setOfferCategory(e.target.value as string)}
            label="Offer Category"
          >
            <MenuItem value="discount">Discount</MenuItem>
            <MenuItem value="cashback">Cashback</MenuItem>
            <MenuItem value="bogof">Buy One Get One</MenuItem>
          </Select>
        </FormControl>

        {/* Offer Type (Discount Type) */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Offer Type</InputLabel>
          <Select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as string)}
            label="Offer Type"
          >
            <MenuItem value="10_percent">Get 10% Off</MenuItem>
            <MenuItem value="newcomers">Newcomers (25% Off)</MenuItem>
            <MenuItem value="weekend_off">Weekend Off (50% Off)</MenuItem>
          </Select>
        </FormControl>

        {/* Offer Percentage */}
        <TextField
          label="Offer Percentage"
          type="number"
          value={offerPercentage}
          onChange={(e) => setOfferPercentage(Number(e.target.value))}
          fullWidth
          sx={{ mb: 2 }}
          inputProps={{ min: 0, max: 100 }}
        />

        {/* Offer Code */}
        <TextField
          label="Offer Code"
          value={offerCode}
          onChange={(e) => setOfferCode(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: <InputAdornment position="start">#</InputAdornment>,
          }}
        />

        {/* Offer Description */}
        <TextField
          label="Offer Description"
          value={offerDesc}
          onChange={(e) => setOfferDesc(e.target.value)}
          placeholder="Describe the offer..."
          fullWidth
          multiline
          rows={4}
          sx={{ mb: 2 }}
        />

        {/* From Date */}
        <DatePicker
          label="From"
          value={fromDate}
          onChange={(newValue) => setFromDate(newValue)}
          renderInput={(params) => (
            <TextField {...params} fullWidth sx={{ mb: 2 }} placeholder="Select start date" />
          )}
        />

        {/* To Date */}
        <DatePicker
          label="To"
          value={toDate}
          onChange={(newValue) => setToDate(newValue)}
          renderInput={(params) => (
            <TextField {...params} fullWidth sx={{ mb: 2 }} placeholder="Select end date" />
          )}
        />

        {/* Offer Active switch */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            Offer Active
          </Typography>
          <Switch
            checked={offerActive}
            onChange={(e) => setOfferActive(e.target.checked)}
            color="primary"
          />
        </Box>

        {/* Preview button */}
        <Button
          variant="contained"
          onClick={handlePreview}
          sx={{
            backgroundColor: '#ff9800',
            color: '#fff',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#fb8c00',
            },
            width: '100%',
          }}
        >
          Preview
        </Button>
      </Box>

      {/* Dialog for preview */}
      <Dialog
        open={openPreview}
        onClose={handleClosePreview}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ position: 'relative', p: 0 }}>
          {/* Close button (optional) */}
          <IconButton
            onClick={handleClosePreview}
            sx={{ position: 'absolute', top: 8, right: 8, color: '#fff', zIndex: 2 }}
          >
            <CloseIcon />
          </IconButton>

          {/* Voucher Preview Container */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              backgroundColor: '#1a1a1a',
              color: '#fff',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            {/* Left Section (Text) */}
            <Box sx={{ flex: 1, p: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                GIFT VOUCHER
              </Typography>

              <Typography variant="body2" sx={{ mb: 2 }}>
                {offerDesc || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
              </Typography>

              {/* Discount Highlight */}
              <Box
                sx={{
                  backgroundColor: '#ffc107',
                  display: 'inline-block',
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  mb: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#000' }}>
                  {offerPercentage ? `${offerPercentage}% DISCOUNT` : 'DISCOUNT'}
                </Typography>
              </Box>

              {/* Offer Code */}
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                Code: #{offerCode || 'N/A'}
              </Typography>

              {/* Validity Dates */}
              <Typography variant="body2">
                Valid from{' '}
                {fromDate ? fromDate.format('MMM D, YYYY') : 'N/A'}{' '}
                to{' '}
                {toDate ? toDate.format('MMM D, YYYY') : 'N/A'}
              </Typography>
            </Box>

            {/* Right Section (Image) */}
            <Box sx={{ flex: 1 }}>
              <img
                src={offerUrl || 'https://via.placeholder.com/600x400?text=No+Image+Provided'}
                alt="Offer Banner"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </LocalizationProvider>
  );
};

export default Offers;
