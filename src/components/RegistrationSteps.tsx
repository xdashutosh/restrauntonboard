import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Stack,
  Typography,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  Chip,
  Drawer
} from '@mui/material';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../interceptor/axiosInstance'
import { RootState } from '../store/store';


interface Station {
  station_id: number;
  station_name: string;
}

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function RegistrationForm() {
  const [formState, setFormState] = useState<Record<string, any>>({
      opening_time: '',
      closing_time: '',
      rest_time_start: '',
      rest_time_finish: '',
      operating_days: "{FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE}", // Default all false
      media_url: "{}" // Media URLs stored in JSON-like format
  });

  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [confirmAcn, setConfirmAcn] = useState<string>(""); 
  const [operatingDays, setOperatingDays] = useState<boolean[]>([false, false, false, false, false, false, false]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaInput, setMediaInput] = useState<string>("");
  const [selectAll, setSelectAll] = useState<boolean>(false);

  const [stations,setstations]=useState<any>([]);

  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false); // State for drawer
  const toggleDrawer = (open: boolean) => {
    setDrawerOpen(open);
  };

  const userData = useSelector((state: RootState) => state.auth.userData);
  const dispatch= useDispatch();
  useEffect(()=>{
  const getdata = async()=>{
    const res = await axiosInstance.get(`/restraunts/?vendor_id=${userData?.vendor_id}`);
    console.log(res?.data?.data?.rows[0]?.verified);
    if(res?.data?.data?.rows?.length>0)
    {
    if(res?.data?.data?.rows[0]?.verified==0)
    {
      toggleDrawer(true);
    }
    else{
      navigate("/dashboard");
    }
    }
  }
  getdata();
  },[userData]);



  const Addrestraunt = async()=>{
    try {
      const response = await axiosInstance.post('/restraunt', {
        ...formState,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    });
    } catch (error) {
      
    }
  }

  // Handle Text Input and Time Picker Changes
  const handleChange = (e: any, key?: string) => {
      if (key) {
          // Handle TimePicker changes
          setFormState((prevState) => ({
              ...prevState,
              [key]: e ? dayjs(e).format('HH:mm') : '', // Store in HH:mm format
          }));
      } else {
          // Handle TextField changes
          const { name, value } = e.target;
          setFormState((prevState) => ({
              ...prevState,
              [name]: value,
          }));
      }
  };

  useEffect(() => {
      setFormState((prevState) => ({
          ...prevState,
          station_id: selectedStation?.station_id || '',
          vendor_id:userData?.vendor_id
      }));
  }, [selectedStation]);


  console.log(formState)
  useEffect(()=>{
    const getdata = async()=>{
      const res  = await axiosInstance.get('/stations');
      setstations(res.data.data.rows);
    }
    getdata();
  },[])



  // ✅ Handle Checkbox Change for Operating Days
  const handleDayToggle = (index: number) => {
      const updatedDays = [...operatingDays];
      updatedDays[index] = !updatedDays[index]; // Toggle true/false

      setOperatingDays(updatedDays);

      // Convert array to "{TRUE, FALSE, ...}" format for formState
      const formattedDays = `{${updatedDays.map(day => day ? "TRUE" : "FALSE").join(", ")}}`;

      setFormState((prevState) => ({
          ...prevState,
          operating_days: formattedDays,
      }));
      setSelectAll(updatedDays.every(day => day));
  };

  const handleSelectAllToggle = () => {
      const newSelectAll = !selectAll;
      setSelectAll(newSelectAll);

      const updatedDays = weekDays.map(() => newSelectAll);
      setOperatingDays(updatedDays);

      // Convert array to "{TRUE, FALSE, ...}" format for formState
      const formattedDays = `{${updatedDays.map(day => day ? "TRUE" : "FALSE").join(", ")}}`;

      setFormState((prevState) => ({
          ...prevState,
          operating_days: formattedDays,
      }));
  };

  const handleAddMedia = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" && mediaInput.trim() !== "") {
          event.preventDefault();
          setMediaUrls([...mediaUrls, mediaInput.trim()]);
          setMediaInput("");

          // Store in formState as "{media1, media2, ...}"
          setFormState((prevState) => ({
              ...prevState,
              media_url: `{${[...mediaUrls, mediaInput.trim()].join(", ")}}`,
          }));
      }
  };

  // ✅ Handle Removing Media URL Chip
  const handleRemoveMedia = (index: number) => {
      const updatedMedia = mediaUrls.filter((_, i) => i !== index);
      setMediaUrls(updatedMedia);

      // Update formState after removal
      setFormState((prevState) => ({
          ...prevState,
          media_url: `{${updatedMedia.join(", ")}}`,
      }));
  };

  return (
    <Stack p={2}>
    <Stack spacing={2} mt={1}>
                    <TextField
                        fullWidth
                        label="Name"
                        name="name"
                        value={formState.name || ''}
                        onChange={handleChange}
                    />
                    <TextField
                        fullWidth
                        label="Owner's name"
                        name="owner_name"
                        value={formState.owner_name || ''}
                        onChange={handleChange}
                    />
                    {stations.length > 0 && <Autocomplete
                        options={stations}
                        getOptionLabel={(option) => option.station_name}
                        value={selectedStation}
                        onChange={(_, newValue) => setSelectedStation(newValue)}
                        renderInput={(params) => (
                            <TextField {...params} label="Select Station" variant="outlined" />
                        )}
                        clearOnEscape
                    />}
                    <TextField
                        fullWidth
                        label="Street"
                        name="street"
                        value={formState.street || ''}
                        onChange={handleChange}
                    />

                    <Stack direction={'row'} gap={1}>
                        <TextField
                            fullWidth
                            label="Pincode"
                            name="pincode"
                            value={formState.pincode || ''}
                            onChange={handleChange}
                        />
                        <TextField
                            fullWidth
                            label="City"
                            name="city"
                            value={formState.city || ''}
                            onChange={handleChange}
                        />
                        <TextField
                            fullWidth
                            label="State"
                            name="state"
                            value={formState.state || ''}
                            onChange={handleChange}
                        />
                    </Stack>
                    <Stack direction={'row'} gap={1}>
                        <TextField
                            fullWidth
                            label="Outlet Email"
                            name="email"
                            value={formState.email || ''}
                            onChange={handleChange}
                        />
                        <TextField
                            fullWidth
                            label="Outlet Contact Number"
                            name="phone"
                            value={formState.phone || ''}
                            onChange={handleChange}
                        />
                    </Stack>

                    <TextField
                        fullWidth
                        label="GST Number"
                        name="gst"
                        value={formState.gst || ''}
                        onChange={handleChange}
                    />
                    <Stack direction={'row'} gap={1}>
                        <TextField
                            fullWidth
                            label="FSSAI Number"
                            name="fssai"
                            value={formState.fssai || ''}
                            onChange={handleChange}
                        />

                        <TextField
                            fullWidth
                            label="FSSAI Expiry"
                            name="fssai_exp"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            type='date'
                            value={formState.fssai_exp || ''}
                            onChange={handleChange}
                        />
                    </Stack>
                    <TextField
                        fullWidth
                        label="Identity Proof"
                        name="id_proof"
                        placeholder='link for aadhar,pancard etc...'
                        value={formState.id_proof || ''}
                        onChange={handleChange}
                    />
                    <Stack direction={'row'} gap={1}>

                        <TextField
                            fullWidth
                            label="Distance from station(kms)"
                            name="distance"
                            type='number'
                            value={formState.distance || ''}
                            onChange={handleChange}
                        />

                        <TextField
                            fullWidth
                            label="Delivery Time (In min)"
                            name="delivery_time"
                            type='number'
                            value={formState.delivery_time}
                            onChange={handleChange}
                        />

                    </Stack>
                    <Stack direction="row" width={'100%'} justifyContent={'space-between'}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <TimePicker
                                label="Opening Time"
                                value={formState.opening_time ? dayjs(`1970-01-01T${formState.opening_time}`) : null}
                                onChange={(newValue) => handleChange(newValue, "opening_time")}
                            />
                        </LocalizationProvider>

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <TimePicker
                                label="Closing Time"
                                value={formState.closing_time ? dayjs(`1970-01-01T${formState.closing_time}`) : null}
                                onChange={(newValue) => handleChange(newValue, "closing_time")}
                            />
                        </LocalizationProvider>
                    </Stack>
                    <Stack direction="row" width={'100%'} justifyContent={'space-between'}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <TimePicker
                                label="Rest time start"
                                value={formState.rest_time_start ? dayjs(`1970-01-01T${formState.rest_time_start}`) : null}
                                onChange={(newValue) => handleChange(newValue, "rest_time_start")}
                            />
                        </LocalizationProvider>

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <TimePicker
                                label="Rest time end"
                                value={formState.rest_time_finish ? dayjs(`1970-01-01T${formState.rest_time_finish}`) : null}
                                onChange={(newValue) => handleChange(newValue, "rest_time_finish")}
                            />
                        </LocalizationProvider>
                    </Stack>

                    {/* ✅ Operating Days Checkboxes */}
                    <Typography variant="subtitle1" sx={{ mt: 2 }}>Operating Days</Typography>
                    <Stack>

                    <FormControlLabel
                        control={<Checkbox checked={selectAll} onChange={handleSelectAllToggle} />}
                        label="Select All"
                        />
                    <Stack direction="row" flexWrap="wrap">
                        {weekDays.map((day, index) => (
                            <FormControlLabel
                            key={day}
                            control={
                                <Checkbox
                                        checked={operatingDays[index]}
                                        onChange={() => handleDayToggle(index)}
                                        color="primary"
                                        />
                                    }
                                    label={day}
                                    />
                                ))}
                    </Stack>
                                </Stack>


                    <TextField
                        fullWidth
                        label="Bank Name"
                        name="bank_name"
                        value={formState.bank_name || ''}
                        onChange={handleChange}
                    />
                    <TextField
                        fullWidth
                        label="Bank owner's name"
                        name="bank_owner"
                        value={formState.bank_owner || ''}
                        onChange={handleChange}
                    />
                    <Stack direction={'row'} gap={1}>
                        <TextField
                            fullWidth
                            label="Account Number"
                            name="acn"
                            value={formState.acn || ''}
                            onChange={handleChange}
                        />
                         <TextField
                            fullWidth
                            label="Confirm Account Number"
                            value={confirmAcn}
                            onChange={(e) => setConfirmAcn(e.target.value)} // ✅ Does not affect formState
                            error={formState.acn !== confirmAcn && confirmAcn !== ""}
                            helperText={confirmAcn && formState.acn !== confirmAcn ? "Account numbers do not match" : ""}
                        />
                    
                    </Stack>
                    <TextField
                            fullWidth
                            label="IFSC"
                            name="ifsc"
                            value={formState.ifsc || ''}
                            onChange={handleChange}
                        />

                    <Stack spacing={2} mt={1}>
                        <TextField
                            fullWidth
                            label="Outlet Images"
                            placeholder="Enter Outlet Image URL and press Enter"
                            value={mediaInput}
                            onChange={(e) => setMediaInput(e.target.value)}
                            onKeyDown={handleAddMedia}
                        />
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                            {mediaUrls.map((url, index) => (
                                <Chip
                                    key={index}
                                    label={url}
                                    onDelete={() => handleRemoveMedia(index)}
                                    color="primary"
                                    variant="outlined"
                                />
                            ))}
                        </Stack>
                    </Stack>

                </Stack>
<Button variant="contained" color="primary" fullWidth sx={{ mt: 4, p: 2, borderRadius: '12px', backgroundColor: '#FF6B3F',fontWeight:'bolder',fontSize:'medium' }} onClick={Addrestraunt}>
          Submit
        </Button>

<Drawer
          anchor="bottom"
          open={drawerOpen}
          sx={{
            '& .MuiDrawer-paper': {
              height: '45vh', // 40% of viewport height
              borderRadius: '50px 50px 0 0', // Rounded top corners
              bgcolor: '#FFF4F1', // Same background as form
            },
          }}
        >
         <Stack justifyContent={'center'} alignItems={'center'} height={'100%'} p={4} width={'100%'} textAlign={'center'}>
          <img src='https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRVKyAHIjNlFhGsr9sugvi1_4G868kL9yjR1nbh6SYQcICe2ZUc' height={150} width={150}/>
          <Typography fontFamily={"font-katibeh"} variant='h5' >Pending for Review</Typography>
          <Typography fontFamily={"font-katibeh"} color='gray'  >You'll receive a mail once your details are  reviewed by us.</Typography>
          <Button variant="contained" color="primary" fullWidth sx={{ mt: 4, p: 2, borderRadius: '12px', backgroundColor: '#FF6B3F',fontWeight:'bolder' }} onClick={()=>dispatch(logout())}>
          Okay
        </Button>
         </Stack>
         
        </Drawer>
              </Stack> 
  );
}
