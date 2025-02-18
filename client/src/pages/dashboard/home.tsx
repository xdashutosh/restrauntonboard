import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid,
  CircularProgress
} from '@mui/material';
import { 
  TrendingUp, 
  ShoppingCart, 
  Star, 
  AttachMoney 
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const statsCards = [
  {
    title: "Today's Orders",
    value: "24",
    icon: <ShoppingCart sx={{ fontSize: 40, color: 'primary.main' }} />,
    change: "+12%"
  },
  {
    title: "Revenue",
    value: "₹4,521",
    icon: <AttachMoney sx={{ fontSize: 40, color: 'success.main' }} />,
    change: "+8%"
  },
  {
    title: "Rating",
    value: "4.8",
    icon: <Star sx={{ fontSize: 40, color: 'warning.main' }} />,
    change: "+0.2"
  },
  {
    title: "Growth",
    value: "15%",
    icon: <TrendingUp sx={{ fontSize: 40, color: 'info.main' }} />,
    change: "+3%"
  }
];

export default function Home() {
  const restaurant = useSelector((state: RootState) => state.restaurant.data);

  if (!restaurant) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Welcome, {restaurant.ownerName}
      </Typography>
      
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={6} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  {stat.icon}
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" component="div">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                    <Typography 
                      variant="caption"
                      color={stat.change.startsWith('+') ? 'success.main' : 'error.main'}
                    >
                      {stat.change}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Restaurant Info
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Name: {restaurant.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Location: {restaurant.location}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Min Order: ₹{restaurant.minOrderAmount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Status: {restaurant.isOnline ? 'Online' : 'Offline'}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
