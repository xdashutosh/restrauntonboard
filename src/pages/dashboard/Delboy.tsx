import React, { useState } from 'react';
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

// Dummy data for delivery boys
interface DeliveryBoy {
  id: number;
  name: string;
  phone: string;
  passExpiry: string;
  deliveries: number;
  rating: number;
  avatarUrl: string;
}

const dummyDeliveryBoys: DeliveryBoy[] = [
  {
    id: 1,
    name: 'Rohan Sharma',
    phone: '+91 9876543210',
    passExpiry: '15/02/2025',
    deliveries: 128,
    rating: 4.5,
    avatarUrl: 'https://via.placeholder.com/48x48?text=RS',
  },
  {
    id: 2,
    name: 'Manoj Kumar',
    phone: '+91 9876543210',
    passExpiry: '15/02/2025',
    deliveries: 128,
    rating: 4.5,
    avatarUrl: 'https://via.placeholder.com/48x48?text=MK',
  },
  {
    id: 3,
    name: 'Mohan Sharma',
    phone: '+91 9876543210',
    passExpiry: '15/02/2025',
    deliveries: 128,
    rating: 4.5,
    avatarUrl: 'https://via.placeholder.com/48x48?text=MS',
  },
  {
    id: 4,
    name: 'Rahul Rastogi',
    phone: '+91 9876543210',
    passExpiry: '15/02/2025',
    deliveries: 128,
    rating: 4.5,
    avatarUrl: 'https://via.placeholder.com/48x48?text=RR',
  },
];

const Delboy: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Dialog open/close state
  const [openDialog, setOpenDialog] = useState(false);

  // New Delivery Boy form states
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassExpiry, setNewPassExpiry] = useState('');
  const [newAvatarUrl, setNewAvatarUrl] = useState('');

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Reset form fields when dialog closes
    setNewName('');
    setNewPhone('');
    setNewPassExpiry('');
    setNewAvatarUrl('');
  };

  const handleSubmit = () => {
    // In real app, you would send data to backend or update global state
    console.log({
      newName,
      newPhone,
      newPassExpiry,
      newAvatarUrl,
    });
    handleCloseDialog();
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
        {dummyDeliveryBoys.map((boy) => (
          <Card
            key={boy.id}
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
              src={boy.avatarUrl}
              alt={boy.name}
              sx={{ width: 48, height: 48, mr: { xs: 0, sm: 2 }, mb: { xs: 1, sm: 0 } }}
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
                <Typography variant="body2">Pass Expiry Date: {boy.passExpiry}</Typography>
                <Typography variant="body2">No. of Deliveries: {boy.deliveries}</Typography>
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
                  name={`rating-${boy.id}`}
                  value={boy.rating}
                  precision={0.5}
                  readOnly
                  size="small"
                  sx={{ mr: 1, color: '#ff9800' }}
                />
                <Typography variant="body2">{boy.rating}</Typography>
              </Box>
            </CardContent>

            
              <EditIcon onClick={() => alert(`Edit ${boy.name}`)} />
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
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <TextField
              fullWidth
              label="Phone Number"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
            />
            <TextField
              fullWidth
              label="Pass Expiry Date"
              placeholder="DD/MM/YYYY"
              value={newPassExpiry}
              onChange={(e) => setNewPassExpiry(e.target.value)}
            />
            <TextField
              fullWidth
              label="Profile Image URL"
              placeholder="https://example.com/avatar.jpg"
              value={newAvatarUrl}
              onChange={(e) => setNewAvatarUrl(e.target.value)}
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
