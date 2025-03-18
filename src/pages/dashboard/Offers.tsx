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
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';

const Offers: React.FC = () => {
  // State for offer details
  const [offerType, setOfferType] = useState('');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [offerActive, setOfferActive] = useState(false);

  const handlePreview = () => {
    // In a real app, preview logic goes here
    console.log({
      offerType,
      startDate,
      endDate,
      offerActive,
    });
    alert('Preview clicked!');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          maxWidth: 400,
          mx: 'auto',
          p: 2,
          border: '1px solid #f0f0f0',
          borderRadius: 2,
          backgroundColor: '#fff',
        }}
      >
        {/* Heading */}
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Manage Offers
        </Typography>

        {/* Offer Type */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Offer Type</InputLabel>
          <Select
            value={offerType}
            onChange={(e) => setOfferType(e.target.value as string)}
            label="Offer Type"
          >
            <MenuItem value="discount">Discount</MenuItem>
            <MenuItem value="cashback">Cashback</MenuItem>
            <MenuItem value="bogof">Buy One Get One</MenuItem>
          </Select>
        </FormControl>

        {/* Start Date */}
        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={(newValue) => setStartDate(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Select start date"
              fullWidth
              sx={{ mb: 2 }}
            />
          )}
        />

        {/* End Date */}
        <DatePicker
          label="End Date"
          value={endDate}
          onChange={(newValue) => setEndDate(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Select end date"
              fullWidth
              sx={{ mb: 2 }}
            />
          )}
        />

        {/* Offer Active switch */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
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
            width: '100%', // Make full-width on mobile
          }}
        >
          Preview
        </Button>
      </Box>
    </LocalizationProvider>
  );
};

export default Offers;
