import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const Closer: React.FC = () => {
  // Track which days are selected
  const [selectedDays, setSelectedDays] = useState<Record<string, boolean>>(
    daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: false }), {})
  );
  // Track the "Select All" checkbox
  const [selectAll, setSelectAll] = useState(false);

  // Opening & closing time
  const [openingTime, setOpeningTime] = useState<Dayjs | null>(null);
  const [closingTime, setClosingTime] = useState<Dayjs | null>(null);

  // Particular day closer states
  const [particularDate, setParticularDate] = useState<Dayjs | null>(null);
  const [particularTime, setParticularTime] = useState<Dayjs | null>(null);
  const [reason, setReason] = useState('');

  // Handle "Select All" changes
  const handleSelectAllChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    // Set all days to the same value
    const updatedDays = daysOfWeek.reduce(
      (acc, day) => ({ ...acc, [day]: checked }),
      {}
    );
    setSelectedDays(updatedDays);
  };

  // Handle individual day checkbox changes
  const handleDayChange = (day: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = event.target.checked;
    setSelectedDays((prev) => {
      const newState = { ...prev, [day]: checked };
      // If all days are now checked, set selectAll = true; otherwise false
      const allSelected = daysOfWeek.every((d) => newState[d]);
      setSelectAll(allSelected);
      return newState;
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          maxWidth: 600,
          mx: 'auto',
          p: { xs: 2, sm: 3 },
          border: '1px solid #f0f0f0',
          borderRadius: 2,
          backgroundColor: '#fff',
        }}
      >
        {/* Schedule Closer heading */}
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Schedule Closer
        </Typography>

        {/* Days of week checkboxes */}
        <FormGroup row sx={{ mb: 2 }}>
          {/* Select All */}
          <FormControlLabel
            control={
              <Checkbox
                checked={selectAll}
                onChange={handleSelectAllChange}
                color="primary"
              />
            }
            label="Select All"
          />
          {daysOfWeek.map((day) => (
            <FormControlLabel
              key={day}
              control={
                <Checkbox
                  checked={selectedDays[day]}
                  onChange={handleDayChange(day)}
                  color="primary"
                />
              }
              label={day}
              sx={{ mr: 2 }}
            />
          ))}
        </FormGroup>

        {/* Opening & Closing time pickers */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={6}>
            <TimePicker
              label="Opening Time"
              value={openingTime}
              onChange={(newValue) => setOpeningTime(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  placeholder="00:00"
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <TimePicker
              label="Closing Time"
              value={closingTime}
              onChange={(newValue) => setClosingTime(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  placeholder="00:00"
                />
              )}
            />
          </Grid>
        </Grid>

        {/* Particular Day Closer heading */}
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Particular Day Closer
        </Typography>

        {/* Date & Time pickers + Reason */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <DatePicker
              label="Select Date"
              value={particularDate}
              onChange={(newValue) => setParticularDate(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  placeholder="DD/MM/YYYY"
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <TimePicker
              label="Select Time"
              value={particularTime}
              onChange={(newValue) => setParticularTime(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  placeholder="00:00"
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Reason"
              placeholder="Enter your reason"
              multiline
              minRows={3}
              fullWidth
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default Closer;
