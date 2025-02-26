
import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Divider,
  Chip,
  FormControlLabel,
  Switch as MuiSwitch,
  IconButton,
  Switch,
} from '@mui/material';
import { AccessTime, Visibility, CheckCircle, Wallet } from '@mui/icons-material';
import { toggleOnline } from '../../store/restaurantSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import DashboardDrawer from '../../components/DashboardDrawer';
import { BellIcon, MenuIcon, WalletIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  timeLeft: string;
  items: OrderItem[];
  paymentMode: string;
  total: number;
}

interface OrdersData {
  preparing: Order[];
  outForDelivery: Order[];
  delivered: Order[];
}

const orders: OrdersData = {
  preparing: [
    {
      id: '1234567890',
      timeLeft: '15 mins left',
      items: [
        { name: 'Dal Makhni', quantity: 1, price: 249 },
        { name: 'Tandoori Roti', quantity: 2, price: 29 },
      ],
      paymentMode: 'COD',
      total: 278,
    },
    {
      id: '9876543210',
      timeLeft: '20 mins left',
      items: [
        { name: 'Chicken Burger', quantity: 1, price: 149 },
        { name: 'Medium Fries', quantity: 1, price: 99 },
      ],
      paymentMode: 'COD',
      total: 298,
    },
  ],
  outForDelivery: [{
    id: '9986543210',
    timeLeft: '0 mins left',
    items: [
      { name: 'Chicken Burger', quantity: 1, price: 149 },
      { name: 'Medium Fries', quantity: 1, price: 99 },
    ],
    paymentMode: 'COD',
    total: 298,
  },],
  delivered: [],
};

const Orders: React.FC = () => {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const statusKeys: (keyof OrdersData)[] = ['preparing', 'outForDelivery', 'delivered'];
  const statusLabels: string[] = ['Preparing', 'Out for Delivery', 'Delivered'];
  const [drawerOpen, setDrawerOpen] = useState(false);
  const dispatch = useDispatch();
  const { isOnline } = useSelector((state: RootState) => state.restaurant);
  const location = useLocation();
  let rout = location.pathname;
  console.log(rout)
  return (
    <Box sx={{ width: '100%'}}>
      <Card sx={{
        overflow: "hidden", borderBottomLeftRadius: "30px", backgroundSize: "cover",
        backgroundPosition: "center",
        height: "10vh",
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        boxShadow:1,
        border: 'none',
        mb: 2,
        borderBottomRightRadius: "30px",
      }} variant='outlined'>
        <Stack direction={'row'} width={'100%'} justifyContent={'space-between'} px={2}>
       
          <Box
      sx={{
        display: "flex",
        alignItems: "center",
        bgcolor: "#EAF2EB",
        borderRadius: "30px",
        px: 1,
        py: 0.1,
      }}
    >
      <Typography
        sx={{
          fontSize: "14px",
          fontWeight: "600",
          color: "#2E6734",
        }}
      >
        {isOnline ? "Online" : "Offline"}
      </Typography>
      <Switch
        checked={isOnline || undefined}
        onChange={() => dispatch(toggleOnline())}
        sx={{
          "& .MuiSwitch-switchBase.Mui-checked": {
            color: "#2E6734",
          },
          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
            backgroundColor: "#2E6734",
          },
          "& .MuiSwitch-track": {
            backgroundColor: "#C0C0C0",
          },
        }}
      />
    </Box>
          <Stack direction={'row'} mx={2} gap={2}> 

            <IconButton
              edge="end"
              onClick={() => setDrawerOpen(true)}
              sx={{ bgcolor: '#EAE9ED', borderRadius: 2 }}
            >
              <BellIcon color='black' />
            </IconButton>

            <IconButton
              color="inherit"
              edge="end"
              onClick={() => setDrawerOpen(true)}
              sx={{ bgcolor: '#EAE9ED', borderRadius: 2 }}
            >
              <WalletIcon color='black' />
            </IconButton> 

            <IconButton
              color="inherit"
              edge="end"
              onClick={() => setDrawerOpen(true)}
              sx={{ bgcolor: '#EB8041', borderRadius: 2 }}
            >
              <MenuIcon color='white' />
            </IconButton>

          </Stack>
        </Stack>
      </Card>
    
    
      <Stack px={2}>
      
      <Tabs
        value={tabIndex}
        onChange={(_, newIndex: number) => setTabIndex(newIndex)}
        variant="scrollable"
        textColor="primary"
        indicatorColor="primary"
        sx={{
          bgcolor: '#F5F5F5',
          borderRadius: 2,
          width: '100%',
          '& .MuiTabs-flexContainer': {
            display: 'flex',
            overflowX: 'auto',
            scrollbarWidth: 'none', // Hide scrollbar for Firefox
            msOverflowStyle: 'none', // Hide scrollbar for Internet Explorer/Edge
          },
          '& .MuiTabs-scroller': {
            '&::-webkit-scrollbar': {
              display: 'none', // Hide scrollbar for Chrome, Safari, and Edge
            },
          },
        }}
      >
        {statusLabels.map((label, index) => (
          <Tab
            key={label}
            sx={{ fontFamily: "font-katibeh" }}
            label={<Chip label={`${label} (${orders[statusKeys[index]].length})`} />}
          />
        ))}
      </Tabs>

      {/* Order Cards */}
      <Box sx={{ mt: 2 }}>
        {orders[statusKeys[tabIndex]].length === 0 ? (
          <Typography fontFamily={"font-katibeh"} textAlign="center" color="text.secondary">
            No orders available
          </Typography>
        ) : (
          orders[statusKeys[tabIndex]].map((order) => (
            <Card key={order.id} sx={{ mb: 2, borderRadius: 3 }} variant='outlined'>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontFamily={"font-katibeh"} variant="subtitle2" color="text.secondary">
                    Order ID:<b>#{order.id}</b>
                  </Typography>
                  <Chip
                    icon={<AccessTime fontSize="small" />}
                    label={order.timeLeft}
                    color="warning"
                    size="small"
                  >

                  </Chip>
                </Stack>

                <Divider sx={{ my: 1 }} />
                {order.items.map((item, index) => (
                  <Stack key={index} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.5 }}>
                    <Typography fontFamily={"font-katibeh"}>{item.name} x {item.quantity}</Typography>
                    <Typography fontFamily={"font-katibeh"} fontWeight="bold">₹{item.price}</Typography>
                  </Stack>
                ))}

                <Divider sx={{ my: 1 }} />
                <Stack direction="row" justifyContent="space-between">
                  <Typography fontFamily={"font-katibeh"} variant="subtitle2" color="text.secondary">
                    Payment Mode: {order.paymentMode}
                  </Typography>
                  <Typography fontFamily={"font-katibeh"} fontWeight="bold" color="success.main">₹{order.total}</Typography>
                </Stack>

                <Stack spacing={1} mt={2}>
                  <Button
                    variant="contained"
                    fullWidth

                    sx={{ padding: 2, bgcolor: '#FCE9E4', color: '#D86E47', '&:hover': { bgcolor: '#F5C6A5' } }}
                    startIcon={<Visibility />}
                  >
                    <Typography fontFamily={"font-katibeh"}>
                      View Train Details
                    </Typography>
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ padding: 2, bgcolor: '#E87C4E', '&:hover': { bgcolor: '#D86E47' } }}
                    startIcon={<CheckCircle />}
                  >
                    <Typography fontFamily={"font-katibeh"}>
                      Order Ready
                    </Typography>
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
      </Stack>
    
     
      <DashboardDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </Box>

  );
};

export default Orders;
