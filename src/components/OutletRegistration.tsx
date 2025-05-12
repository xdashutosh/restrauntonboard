import {
  Button,
  TextField,
  Stack,
  Typography,
  FormControlLabel,
  Checkbox,
  Chip,
  Select,
  MenuItem,
  Switch,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import React from 'react';
import axiosInstance from '../interceptor/axiosInstance';
import { Add as AddIcon, Delete as DeleteIcon, Upload as UploadIcon } from '@mui/icons-material';

interface OutletRegistrationProps {
  vendorId: string | number;
  onSubmit: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

interface Station {
  station_id: number;
  station_name: string;
  station_code: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const weekDays = [
  { id: "SUN", label: "Sunday" },
  { id: "MON", label: "Monday" },
  { id: "TUE", label: "Tuesday" },
  { id: "WED", label: "Wednesday" },
  { id: "THU", label: "Thursday" },
  { id: "FRI", label: "Friday" },
  { id: "SAT", label: "Saturday" },
];

export default function OutletRegistration({ vendorId, onSubmit, onBack, showBackButton = true }: OutletRegistrationProps) {
  const [currentTab, setCurrentTab] = useState(0);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add state for station search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Get user data for updated_by field
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  
  const [formData, setFormData] = useState<Record<string, any>>({
    outlet_name: "",
    order_timing: "30",
    min_order_amount: 0,
    opening_time: "08:00",
    closing_time: "22:00",
    delivery_charges: [],
    prepaid: true,
    address: "",
    city: "",
    state: "",
    company_name: "",
    vendor_pan_number: "",
    gst: "",
    fssai: "",
    fssai_valid: "",
    logo_image: "",
    email: "",
    phone: "",
    rlname: "",
    rlemail: "",
    rlphone: "",
    admin_phone: "",
    alternative_phones: [],
    tags: "",
    station_name: "",
    station_code: "",
    vendor_id: vendorId,
    status: 0,
    updated_by: userData?.name || null,
    updated_at: new Date().toISOString(),
    weeklyclosed: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [phoneInput, setPhoneInput] = useState("");
  const [deliveryFees, setDeliveryFees] = useState<any[]>([]);
  const [newAmount, setNewAmount] = useState("");
  const [newFee, setNewFee] = useState("");
  const [selectedTags, setSelectedTags] = useState({
    VEG: false,
    'NON VEG': false
  });

  // Search stations as user types
  useEffect(() => {
    const searchStations = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await axiosInstance.get(`/searchstationname/${searchQuery}`);
        setSearchResults(response?.data || []);
        setShowDropdown(true);
      } catch (error) {
        console.error("Error searching stations:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchStations, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.station-search-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // Handle station selection from dropdown
  const handleStationSelect = (station: any) => {
    setFormData(prev => ({
      ...prev,
      station_name: station.stationName || station.station_name,
      station_code: station.stationCode || station.station_code
    }));
    setShowDropdown(false);
    setSearchQuery('');
    
    // Clear validation error if it exists
    if (errors.station_code) {
      setErrors(prev => ({ ...prev, station_code: '' }));
    }
  };

  const validateTab = (tabIndex: number) => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    switch (tabIndex) {
      case 0: // Basic Info
        if (!formData.outlet_name || formData.outlet_name.length < 2) {
          newErrors.outlet_name = "Outlet name must be at least 2 characters.";
          isValid = false;
        }
        if (!formData.company_name || formData.company_name.length < 2) {
          newErrors.company_name = "Company name must be at least 2 characters.";
          isValid = false;
        }
        if (!formData.address || formData.address.length < 5) {
          newErrors.address = "Address must be at least 5 characters.";
          isValid = false;
        }
        if (!formData.city || formData.city.length < 2) {
          newErrors.city = "City must be at least 2 characters.";
          isValid = false;
        }
        if (!formData.state || formData.state.length < 2) {
          newErrors.state = "State must be at least 2 characters.";
          isValid = false;
        }
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "Please enter a valid email address.";
          isValid = false;
        }
        if (!formData.phone || formData.phone.length < 10) {
          newErrors.phone = "Phone number must be at least 10 digits.";
          isValid = false;
        }
        if (!formData.admin_phone || formData.admin_phone.length < 10) {
          newErrors.admin_phone = "Admin phone number must be at least 10 digits.";
          isValid = false;
        }
        if (!formData.station_code) {
          newErrors.station_code = "Please select a station.";
          isValid = false;
        }
        break;

      case 1: // Business Details
        if (!formData.gst) {
          newErrors.gst = "GST number is required.";
          isValid = false;
        }
        if (!formData.fssai) {
          newErrors.fssai = "FSSAI license is required.";
          isValid = false;
        }
        if (!formData.fssai_valid) {
          newErrors.fssai_valid = "FSSAI validity date is required.";
          isValid = false;
        }
        break;

      case 2: // Order Settings
        if (!formData.opening_time) {
          newErrors.opening_time = "Opening time is required.";
          isValid = false;
        }
        if (!formData.closing_time) {
          newErrors.closing_time = "Closing time is required.";
          isValid = false;
        }
        break;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateTab(currentTab)) {
      setCurrentTab(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentTab(prev => prev - 1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          logo_image: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTagChange = (tagName: string) => {
    const updatedTags = {
      ...selectedTags,
      [tagName]: !selectedTags[tagName as keyof typeof selectedTags]
    };
    
    setSelectedTags(updatedTags);
    
    const newTags = Object.keys(updatedTags)
      .filter(tag => updatedTags[tag as keyof typeof updatedTags])
      .join(',');
    
    setFormData(prev => ({
      ...prev,
      tags: newTags
    }));
  };

  const addPhoneNumber = () => {
    if (phoneInput && phoneInput.trim().length >= 10) {
      const currentPhones = formData.alternative_phones || [];
      if (!currentPhones.includes(phoneInput.trim())) {
        setFormData(prev => ({
          ...prev,
          alternative_phones: [...currentPhones, phoneInput.trim()]
        }));
        setPhoneInput("");
      }
    }
  };

  const removePhoneNumber = (phone: string) => {
    setFormData(prev => ({
      ...prev,
      alternative_phones: prev.alternative_phones.filter((p: string) => p !== phone)
    }));
  };

  const addDeliveryFee = () => {
    if (!newAmount || !newFee) return;
    
    const amount = parseFloat(newAmount);
    const fee = parseFloat(newFee);
    
    if (isNaN(amount) || isNaN(fee)) return;
    
    const newDeliveryFees = [...deliveryFees, { amountMoreThan: amount, deliveryFee: fee }];
    newDeliveryFees.sort((a, b) => a.amountMoreThan - b.amountMoreThan);
    
    setDeliveryFees(newDeliveryFees);
    setFormData(prev => ({
      ...prev,
      delivery_charges: newDeliveryFees
    }));
    setNewAmount('');
    setNewFee('');
  };

  const removeDeliveryFee = (index: number) => {
    const newDeliveryFees = deliveryFees.filter((_, i) => i !== index);
    setDeliveryFees(newDeliveryFees);
    setFormData(prev => ({
      ...prev,
      delivery_charges: newDeliveryFees
    }));
  };

  const handleWeekdayToggle = (day: string) => {
    const currentWeeklyClosed = formData.weeklyclosed || [];
    setFormData(prev => ({
      ...prev,
      weeklyclosed: currentWeeklyClosed.includes(day)
        ? currentWeeklyClosed.filter((d: string) => d !== day)
        : [...currentWeeklyClosed, day]
    }));
  };

  const handleSubmit = async () => {
    if (!validateTab(currentTab)) return;

    try {
      // Format delivery charges as JSON string
      const formattedData = {
        ...formData,
        delivery_charges: JSON.stringify(deliveryFees),
        updated_at: new Date().toISOString()
      };

      const response = await axiosInstance.post('/restraunt', formattedData);
      
      if (response?.data?.data?.rows?.length > 0) {
        onSubmit();
      }
    } catch (error) {
      console.error('Error adding outlet:', error);
      // Handle error
    }
  };

  return (
    <Stack spacing={2} width={'100%'}>
      <Typography variant="h5" sx={{ mb: 2 }}>Outlet Registration</Typography>
      
      <Tabs value={currentTab} onChange={handleTabChange}>
        <Tab label="Basic Info" />
        <Tab label="Business Details" />
        <Tab label="Order Settings" />
      </Tabs>

      <TabPanel value={currentTab} index={0}>
        <Card variant='outlined' >
          <CardContent >
            <Stack spacing={3} >
              <Typography variant="h6">Basic Information</Typography>
              
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="Outlet Name*"
                  name="outlet_name"
                  value={formData.outlet_name}
                  onChange={handleChange}
                  error={!!errors.outlet_name}
                  helperText={errors.outlet_name}
                />
                
                <TextField
                  fullWidth
                  label="Company Name*"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  error={!!errors.company_name}
                  helperText={errors.company_name}
                />
              </Stack>

              {/* Updated Station Search Section */}
              <Box className="station-search-container" sx={{ position: 'relative' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Station *</Typography>
                <TextField
                  fullWidth
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                  placeholder="Type to search stations..."
                  error={!!errors.station_code}
                  helperText={errors.station_code}
                  InputProps={{
                    endAdornment: isSearching && (
                      <InputAdornment position="end">
                        <CircularProgress size={20} />
                      </InputAdornment>
                    )
                  }}
                />
                
                {/* Selected station display */}
                {formData.station_name && formData.station_code && !searchQuery && (
                  <Typography 
                    variant="body2" 
                    sx={{ mt: 1, color: 'primary.main' }}
                  >
                    Selected: {formData.station_name} ({formData.station_code})
                  </Typography>
                )}
                
                {/* Dropdown for search results */}
                {showDropdown && searchResults.length > 0 && (
                  <Paper
                    sx={{
                      position: 'absolute',
                      zIndex: 10,
                      width: '100%',
                      mt: 1,
                      maxHeight: '240px',
                      overflow: 'auto',
                      boxShadow: 3
                    }}
                  >
                    <List>
                      {searchResults.map((station: any) => (
                        <ListItem
                          key={station.stationId || station.station_id}
                          onClick={() => handleStationSelect(station)}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { 
                              backgroundColor: 'action.hover' 
                            } 
                          }}
                        >
                          <ListItemText
                            primary={station.stationName || station.station_name}
                            secondary={station.stationCode || station.station_code}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
              </Box>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Address*"
                name="address"
                value={formData.address}
                onChange={handleChange}
                error={!!errors.address}
                helperText={errors.address}
              />

              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="City*"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  error={!!errors.city}
                  helperText={errors.city}
                />
                
                <TextField
                  fullWidth
                  label="State*"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  error={!!errors.state}
                  helperText={errors.state}
                />
              </Stack>

              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="Email*"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                />
                
                <TextField
                  fullWidth
                  label="Phone*"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!errors.phone}
                  helperText={errors.phone}
                />
              </Stack>

              <TextField
                fullWidth
                label="Admin Phone*"
                name="admin_phone"
                value={formData.admin_phone}
                onChange={handleChange}
                error={!!errors.admin_phone}
                helperText={errors.admin_phone}
              />

              <Typography variant="subtitle1">Relationship Manager</Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="Name"
                  name="rlname"
                  value={formData.rlname}
                  onChange={handleChange}
                />
                
                <TextField
                  fullWidth
                  label="Email"
                  name="rlemail"
                  value={formData.rlemail}
                  onChange={handleChange}
                />
                
                <TextField
                  fullWidth
                  label="Phone"
                  name="rlphone"
                  value={formData.rlphone}
                  onChange={handleChange}
                />
              </Stack>

              <Box>
                <Typography variant="subtitle1" gutterBottom>Alternative Phones</Typography>
                <Stack direction="row" spacing={1} mb={1} flexWrap="wrap">
                  {formData.alternative_phones.map((phone: string, index: number) => (
                    <Chip
                      key={index}
                      label={phone}
                      onDelete={() => removePhoneNumber(phone)}
                      color="primary"
                      size="small"
                    />
                  ))}
                </Stack>
                <Stack direction="row" spacing={1}>
                  <TextField
                    fullWidth
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="Enter phone number"
                  />
                  <Button variant="contained" onClick={addPhoneNumber}>
                    Add
                  </Button>
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle1" gutterBottom>Logo Image</Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                >
                  Upload Logo
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Button>
                {formData.logo_image && (
                  <Box mt={2}>
                    <img
                      src={formData.logo_image}
                      alt="Logo preview"
                      style={{ maxWidth: '200px', maxHeight: '200px' }}
                    />
                  </Box>
                )}
              </Box>

              <Box>
                <Typography variant="subtitle1" gutterBottom>Tags</Typography>
                <Stack direction="row" spacing={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedTags.VEG}
                        onChange={() => handleTagChange('VEG')}
                      />
                    }
                    label="VEG"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedTags['NON VEG']}
                        onChange={() => handleTagChange('NON VEG')}
                      />
                    }
                    label="NON VEG"
                  />
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Typography variant="h6">Business Details</Typography>
              
              <TextField
                fullWidth
                label="PAN Number"
                name="vendor_pan_number"
                value={formData.vendor_pan_number}
                onChange={handleChange}
              />
              
              <TextField
                fullWidth
                label="GST Number*"
                name="gst"
                value={formData.gst}
                onChange={handleChange}
                error={!!errors.gst}
                helperText={errors.gst}
              />
              
              <TextField
                fullWidth
                label="FSSAI License*"
                name="fssai"
                value={formData.fssai}
                onChange={handleChange}
                error={!!errors.fssai}
                helperText={errors.fssai}
              />
              
              <TextField
                fullWidth
                label="FSSAI Valid Till*"
                name="fssai_valid"
                type="date"
                value={formData.fssai_valid}
                onChange={handleChange}
                error={!!errors.fssai_valid}
                helperText={errors.fssai_valid}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Typography variant="h6">Order Settings</Typography>
              
              <Stack direction="row" spacing={2}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <TimePicker
                    label="Opening Time*"
                    value={formData.opening_time ? dayjs(`1970-01-01T${formData.opening_time}`) : null}
                    onChange={(newValue) => {
                      setFormData(prev => ({
                        ...prev,
                        opening_time: newValue ? dayjs(newValue).format('HH:mm') : ''
                      }));
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.opening_time,
                        helperText: errors.opening_time
                      }
                    }}
                  />
                </LocalizationProvider>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <TimePicker
                    label="Closing Time*"
                    value={formData.closing_time ? dayjs(`1970-01-01T${formData.closing_time}`) : null}
                    onChange={(newValue) => {
                      setFormData(prev => ({
                        ...prev,
                        closing_time: newValue ? dayjs(newValue).format('HH:mm') : ''
                      }));
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.closing_time,
                        helperText: errors.closing_time
                      }
                    }}
                  />
                </LocalizationProvider>
              </Stack>

              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="Order Preparation Time (minutes)*"
                  name="order_timing"
                  type="number"
                  value={formData.order_timing}
                  onChange={handleChange}
                />
                
                <TextField
                  fullWidth
                  label="Minimum Order Amount*"
                  name="min_order_amount"
                  type="number"
                  value={formData.min_order_amount}
                  onChange={handleChange}
                />
              </Stack>

              <Box>
                <Typography variant="subtitle1" gutterBottom>Delivery Charges</Typography>
                <Stack spacing={2}>
                  {deliveryFees.map((fee, index) => (
                    <Stack key={index} direction="row" alignItems="center" spacing={2}>
                      <Typography>Amount more than ₹{fee.amountMoreThan}</Typography>
                      <Typography>Delivery fee: ₹{fee.deliveryFee}</Typography>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => removeDeliveryFee(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  ))}
                  
                  <Stack direction="row" spacing={2}>
                    <TextField
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      placeholder="Amount threshold"
                      type="number"
                    />
                    <TextField
                      value={newFee}
                      onChange={(e) => setNewFee(e.target.value)}
                      placeholder="Delivery fee"
                      type="number"
                    />
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={addDeliveryFee}
                    >
                      Add
                    </Button>
                  </Stack>
                </Stack>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.prepaid}
                    onChange={(e) => setFormData(prev => ({ ...prev, prepaid: e.target.checked }))}
                  />
                }
                label="Accept Prepaid Orders"
              />

              <Box>
                <Typography variant="subtitle1" gutterBottom>Weekly Closing Days</Typography>
                <Stack direction="row" flexWrap="wrap" spacing={1}>
                  {weekDays.map((day) => (
                    <FormControlLabel
                      key={day.id}
                      control={
                        <Checkbox
                          checked={formData.weeklyclosed?.includes(day.id) || false}
                          onChange={() => handleWeekdayToggle(day.id)}
                        />
                      }
                      label={day.label}
                    />
                  ))}
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </TabPanel>

      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        {currentTab > 0 && (
          <Button
            variant="outlined"
            onClick={handlePrevious}
          >
            Previous
          </Button>
        )}
        
        {showBackButton && onBack && currentTab === 0 && (
          <Button
            variant="outlined"
            onClick={onBack}
          >
            Back
          </Button>
        )}
        
        {currentTab < 2 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{ ml: 'auto', backgroundColor: '#FF6B3F' }}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ ml: 'auto', backgroundColor: '#FF6B3F' }}
          >
            Submit
          </Button>
        )}
      </Stack>
    </Stack>
  );
}