import { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
  Autocomplete,
  Divider,
  Drawer,
  Stack
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import PhotoUpload from './PhotoUpload';
import React from 'react';

const INDIAN_STATIONS = [
  'Mumbai Central',
  'Delhi',
  'Bangalore',
  'Chennai',
  'Kolkata',
  'Hyderabad',
  // Add more stations...
];

export default function RegistrationForm() {
  const [workingDays, setWorkingDays] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false
  });
  const [openingTime, setOpeningTime] = useState(null);
  const [closingTime, setClosingTime] = useState(null);
  const [whatsappSameAsPhone, setWhatsappSameAsPhone] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [documents, setDocuments] = useState({
    gst: '',
    fssai: '',
    idProof: '',
    addressProof: ''
  });
  const [drawerOpen, setDrawerOpen] = useState(false); // State for drawer
  const toggleDrawer = (open: boolean) => {
    setDrawerOpen(open);
  };

  const handleWorkingDayChange = (day: string, checked: boolean) => {
    setWorkingDays({ ...workingDays, [day]: checked });
  };

  const handleSelectAllDays = (checked: boolean) => {
    setWorkingDays({
      monday: checked,
      tuesday: checked,
      wednesday: checked,
      thursday: checked,
      friday: checked,
      saturday: checked,
      sunday: checked
    });
  };

  return (
    <Box sx={{ width: '100%', p: 3, borderRadius: '12px', background: '#FFF4F1',boxShadow:'none' }}>
      <Typography fontFamily={"font-katibeh"} variant="h4" ><b style={{color:'#FF6B3F'}}>Add</b> Restaurant</Typography>
      <Typography fontFamily={"font-katibeh"} sx={{ color: 'gray', mb: 2}}>Provide basic details like restaurant name, location, owner name, and contact information etc.</Typography>
      <Divider/>
      <Box component="form" noValidate autoComplete="off" sx={{mt:2}}>
        <Typography fontFamily={"font-katibeh"} variant="h6" sx={{ mb: 1 }}>Basic Details</Typography>
        <TextField 
          fullWidth
          label="Restaurant Name"
          placeholder="Enter your restaurant name"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3, // Apply border-radius
              bgcolor:'white'
            },
            mb:2
          }}
        />
        <TextField 
          fullWidth
          label="Owner Name"
          placeholder="Enter your name"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3, // Apply border-radius
              bgcolor:'white'
            },
            mb:2
          }}        />
        <Autocomplete
          options={INDIAN_STATIONS}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Station Location"
              placeholder="Select station location"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3, // Apply border-radius
                  bgcolor:'white'
                },
                mb:2
              }}            />
          )}
        />
        <TextField 
          fullWidth
          label="Minimum Order Amount"
          placeholder="Select minimum order amount"
          type="number"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3, // Apply border-radius
              bgcolor:'white'
            },
            mb:2
          }}        />
        <Divider sx={{my:2}}/>
        <Typography fontFamily={"font-katibeh"} variant="h6" sx={{ mt: 4, mb: 1 }}>Restaurant Photos</Typography>
        <PhotoUpload onChange={()=>{}} max={4} />
        <Divider sx={{my:4}}/>
        
        <Typography fontFamily={"font-katibeh"} variant="h6" sx={{ mt: 4, mb: 1 }}>Owner Contact Details</Typography>
        <TextField 
          fullWidth
          label="Email Address"
          placeholder="Enter your email address"
          type="email"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3, // Apply border-radius
              bgcolor:'white'
            },
            mb:2
          }}        />
        <TextField 
          fullWidth
          label="Mobile Number"
          placeholder="Enter your mobile number"
          type="tel"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3, // Apply border-radius
              bgcolor:'white'
            },
            mb:2
          }}          onChange={(e) => setMobileNumber(e.target.value)}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={whatsappSameAsPhone}
              onChange={(e) => setWhatsappSameAsPhone(e.target.checked)}
            />
          }
          label="WhatsApp number is same as above"
        />
        {!whatsappSameAsPhone && (
          <TextField 
            fullWidth
            label="WhatsApp Number"
            placeholder="Enter WhatsApp number"
            type="tel"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3, // Apply border-radius
                bgcolor:'white'
              },
              mb:2
            }}            onChange={(e) => setWhatsappNumber(e.target.value)}
          />
        )}

        <Typography fontFamily={"font-katibeh"} variant="h6" sx={{ mt: 4, mb: 1 }}>Select Working Days & Time</Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                onChange={(e) => handleSelectAllDays(e.target.checked)}
              />
            }
            label="Select All"
          />
          {Object.entries(workingDays).map(([day, checked]) => (
            
            <FormControlLabel
              key={day}
              control={
                <Checkbox
                  checked={checked}
                  onChange={(e) => handleWorkingDayChange(day, e.target.checked)}
                />
              }
              label={day.charAt(0).toUpperCase() + day.slice(1)}
            />
          ))}
        </FormGroup>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <MobileTimePicker
              label="Opening Time"
              value={openingTime}
              onChange={(newValue:any) => setOpeningTime(newValue)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3, // Apply border-radius
                  bgcolor:'white'
                },
                mb:2
              }}
            />
            <MobileTimePicker
              label="Closing Time"
              value={closingTime}
              onChange={(newValue:any) => setClosingTime(newValue)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3, // Apply border-radius
                  bgcolor:'white'
                },
                mb:2
              }}            />
          </Box>
        </LocalizationProvider>

        <Typography fontFamily={"font-katibeh"} variant="h6" sx={{ mt: 4, mb: 1 }}>Address Proof & Documents</Typography>
        <PhotoUpload onChange={()=>{}} label="Upload your GST Certificate" max={1} />
        <PhotoUpload onChange={()=>{}} label="Upload your FSSAI" max={1} />
        <PhotoUpload onChange={()=>{}} label="Upload your ID Proof" max={1} />
        <PhotoUpload onChange={()=>{}} label="Upload your Address Proof" max={1} />

        <Button variant="contained" color="primary" fullWidth sx={{ mt: 4, p: 2, borderRadius: '12px', backgroundColor: '#FF6B3F' }}>
          Submit
        </Button>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 4, p: 2, borderRadius: '12px', backgroundColor: '#FF6B3F' }}
          onClick={() => toggleDrawer(true)} // Open drawer on click
        >
          Open Drawer
        </Button>

        <Drawer
          anchor="bottom"
          open={drawerOpen}
          sx={{
            '& .MuiDrawer-paper': {
              height: '40vh', // 40% of viewport height
              borderRadius: '40px 40px 0 0', // Rounded top corners
              bgcolor: '#FFF4F1', // Same background as form
            },
          }}
        >
         <Stack justifyContent={'center'} alignItems={'center'} height={'100%'} p={4} width={'100%'} textAlign={'center'}>
          <img src='https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRVKyAHIjNlFhGsr9sugvi1_4G868kL9yjR1nbh6SYQcICe2ZUc' height={150} width={150}/>
          <Typography fontFamily={"font-katibeh"} variant='h5' >Pending for Review</Typography>
          <Typography fontFamily={"font-katibeh"} color='gray'  >You'll receive a mail once your details are  reviewed by us.</Typography>
          <Button variant="contained" color="primary" fullWidth sx={{ mt: 4, p: 2, borderRadius: '12px', backgroundColor: '#FF6B3F',fontWeight:'bolder' }}>
          Okay
        </Button>
         </Stack>
         
        </Drawer>
      </Box>
    </Box>
  );
}
