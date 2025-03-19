import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Rating,
  DialogActions,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import axiosInstance from '../../interceptor/axiosInstance';
import { useToast } from '../../hooks/use-toast';


interface props {
  restdata:any;
}

const Delboy: React.FC<props> = ({restdata}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Dialog open/close state
  const [openDialog, setOpenDialog] = useState(false);
  const { toast } = useToast();
  // New Delivery Boy form states
  const [name, setname] = useState('');
  const [phone, setphone] = useState('');
  const [docs_exp, setdocs_exp] = useState('');
  const [docs, setdocs] = useState('');
  const [aadhar, setaadhar] = useState<any>(null);
  const [del_profile, setdel_profile] = useState('');
  const [Delboys,setdelboys]=useState<any>([]);
console.log(restdata);
  useEffect(()=>{
     const getdata = async()=>{
       try {
         const res = await axiosInstance.get(`/dels/?res_id=${restdata?.res_id}`);
 console.log(res?.data?.data);
 setdelboys(res?.data?.data?.rows);
       } catch (error) {
         
       }
     }
     getdata();
   },[restdata])

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Reset form fields when dialog closes
    setname('');
    setphone('');
    setdocs_exp('');
    setdel_profile('');
  };

  const handleSubmit = async() => {
try {
  await axiosInstance.post("/del",{name,phone,docs,docs_exp,aadhar,del_profile,"res_id":restdata?.res_id})
    handleCloseDialog();
} catch (error) {
  toast({
    title:error.message,
    // description: "Please enter a valid 10-digit phone number",
    variant: "destructive"
  });
}
    
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      {/* Header row: Title on left, Add button on right */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h5">Delivery Boys</Typography>
        <Button
          variant="contained"
          onClick={handleOpenDialog}
          startIcon={<AddIcon />}
          sx={{
            // Adjust color to match your design:
            backgroundColor: '#ff9800',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#fb8c00',
            },
            borderRadius: '50px', // If you want a pill-shaped button
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Add
        </Button>
      </Box>

      {/* List of Delivery Boys */}
      <Stack spacing={2}>
        {Delboys?.map((boy) => (
          <Card
            key={boy.del_id}
            sx={{
              display: 'flex',
              p: 2,
              justifyContent:'space-between',
              gap:1,
              flexDirection: { xs: 'row', sm: 'row' },
            }}
          >
            {/* Avatar */}
            <Avatar
              src={boy.del_profile}
              alt={boy.name}
              sx={{height:50,width:50,objectFit:'contain'}}
              // sx={{ width: 48, height: 48, mr: { xs: 0, sm: 2 }, mb: { xs: 1, sm: 0 } }}
            />

            {/* Main content */}
            <CardContent
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                p: 0,
              }}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {boy.name}
                </Typography>
                <Typography variant="body2">{boy.phone}</Typography>
                <Typography variant="body2">Pass Expiry Date: {boy.docs_exp}</Typography>
                <Typography variant="body2">No. of Deliveries: {boy.total_del}</Typography>
              </Box>

              {/* Rating on the right (or below on mobile) */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mt: { xs: 1, sm: 0 },
                }}
              >
                <Rating
                  name={`rating-${boy.res_id}`}
                  value={boy.rating}
                  precision={0.5}
                  readOnly
                  size="small"
                  sx={{ mr: 1, color: '#ff9800' }}
                />
                <Typography variant="body2">{boy.rating}</Typography>
              </Box>
            </CardContent>

            
              {/* <EditIcon onClick={() => alert(`Edit ${boy.name}`)} /> */}
          </Card>
        ))}
      </Stack>

      {/* Dialog for adding a new Delivery Boy */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Onboard Delivery Person</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={name}
              onChange={(e) => setname(e.target.value)}
            />
            <TextField
              fullWidth
              label="Phone Number"
              value={phone}
              onChange={(e) => setphone(e.target.value)}
            />
            <TextField
              fullWidth
              label="Pass doc"
              value={docs}
              onChange={(e) => setdocs(e.target.value)}
            />
            <TextField
              fullWidth
              type='date'
              label="Pass Expiry Date"
              placeholder="DD/MM/YYYY"
              value={docs_exp}
              onChange={(e) => setdocs_exp(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="Profile Image URL"
              placeholder="https://example.com/avatar.jpg"
              value={del_profile}
              onChange={(e) => setdel_profile(e.target.value)}
            />

            <TextField
              fullWidth
              label="Aadhar number"
              placeholder="https://example.com/avatar.jpg"
              value={aadhar}
              onChange={(e) => setaadhar(e.target.value)}
            />
             
            <Box>
             
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            variant="contained"
            sx={{
              backgroundColor: '#ff9800',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#fb8c00',
              },
            }}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Delboy;
