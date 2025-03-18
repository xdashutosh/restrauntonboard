import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Card,
  CardContent,
  Avatar,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useNavigate } from 'react-router-dom';

// Each complaint item structure
interface Complaint {
  id: number;
  orderId: string;
  issue: string;
  imageUrl: string; // or use an icon if preferred
}

// Example dummy data for different tabs
const qualityIssues: Complaint[] = [
  {
    id: 1,
    orderId: '#1234567890',
    issue: '“I have problem with the taste.”',
    imageUrl: 'https://via.placeholder.com/48x48?text=Img1',
  },
  {
    id: 2,
    orderId: '#1234567890',
    issue: '“It was not properly cooked.”',
    imageUrl: 'https://via.placeholder.com/48x48?text=Img2',
  },
];

const paymentIssues: Complaint[] = [
  {
    id: 1,
    orderId: '#1234567890',
    issue: '“Payment failed but amount deducted.”',
    imageUrl: 'https://via.placeholder.com/48x48?text=Img3',
  },
  {
    id: 2,
    orderId: '#1234567890',
    issue: '“Payment is pending for a long time.”',
    imageUrl: 'https://via.placeholder.com/48x48?text=Img4',
  },
  {
    id: 3,
    orderId: '#1234567890',
    issue: '“Incorrect amount charged.”',
    imageUrl: 'https://via.placeholder.com/48x48?text=Img5',
  },
  {
    id: 4,
    orderId: '#1234567890',
    issue: '“Could not apply coupon code.”',
    imageUrl: 'https://via.placeholder.com/48x48?text=Img6',
  },
];

const undeliveredIssues: Complaint[] = [
  {
    id: 1,
    orderId: '#1234567890',
    issue: '“The food was cold.”',
    imageUrl: 'https://via.placeholder.com/48x48?text=Img7',
  },
  {
    id: 2,
    orderId: '#1234567890',
    issue: '“The rotis were very hard.”',
    imageUrl: 'https://via.placeholder.com/48x48?text=Img8',
  },
];

// Helper object to store all complaint categories
const complaintData = {
  quality: qualityIssues,
  payment: paymentIssues,
  undelivered: undeliveredIssues,
};

const Queries: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Track which tab is selected
  const [selectedTab, setSelectedTab] = useState(0);

  // Handle tab change
  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  // Decide which data to show based on selected tab
  let currentComplaints: Complaint[] = [];
  if (selectedTab === 0) currentComplaints = complaintData.quality;
  if (selectedTab === 1) currentComplaints = complaintData.payment;
  if (selectedTab === 2) currentComplaints = complaintData.undelivered;
const navigate = useNavigate();
  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: 'auto',
        p: { xs: 2, sm: 3 },
      }}
    >
      {/* Scrollable Tabs on top */}
      <Tabs
        value={selectedTab}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        textColor="primary"
        indicatorColor="primary"
        sx={{
          mb: 2,
          // Customize tab styling as needed
          '& .MuiTab-root': {
            fontWeight: 600,
            textTransform: 'none',
          },
        }}
      >
        <Tab
          label={`Quality Issues (${complaintData.quality.length})`}
          id="quality-issues-tab"
        />
        <Tab
          label={`Payment Issues (${complaintData.payment.length})`}
          id="payment-issues-tab"
        />
        <Tab
          label={`Undelivered Items (${complaintData.undelivered.length})`}
          id="undelivered-items-tab"
        />
      </Tabs>

      {/* Complaints Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <ErrorOutlineIcon
          sx={{
            mr: 1,
            color: '#ff9800', // adjust to match your design
          }}
        />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Complaints
        </Typography>
      </Box>

      {/* List of complaints for the selected tab */}
      <Stack spacing={2}>
        {currentComplaints.map((complaint) => (
          <Card
            key={complaint.id}
            sx={{
              p: 2,
              borderRadius: 2,
              boxShadow: 1,
              display: 'flex',
              alignItems: 'center',
            }}
            onClick ={()=>navigate("/dashboard/chat/1211")}
          >
            {/* Image / Avatar */}
            <Avatar
              src={complaint.imageUrl}
              alt="complaint"
              sx={{ width: 48, height: 48, mr: 2 }}
            />

            {/* Text content */}
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Order ID: {complaint.orderId}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Issue: {complaint.issue}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default Queries;
