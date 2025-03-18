import React, { useEffect, useState } from 'react';
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
  IconButton,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { AccessTime, Visibility, CheckCircle } from '@mui/icons-material';
import { toggleOnline } from '../../store/restaurantSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import DashboardDrawer from '../../components/DashboardDrawer';
import { BellIcon, MenuIcon, WalletIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../../interceptor/axiosInstance';
import Notification from './Notification';
import Wallet from './Wallet';

interface OrderItemUI {
  name: string;
  quantity: number;
  price: number;
}

interface OrderUI {
  id: string;
  timeLeft: string;
  items: OrderItemUI[];
  paymentMode: string;
  total: number;
  train_number:any;
  name:any,
  phone:any,
  train_name:any,
  station_id:any
}

interface OrdersData {
  preparing: OrderUI[];
  outForDelivery: OrderUI[];
  delivered: OrderUI[];
}

const statusLabels: string[] = ['Preparing', 'Out for Delivery', 'Delivered'];
const statusKeys: (keyof OrdersData)[] = ['preparing', 'outForDelivery', 'delivered'];

const Orders: React.FC = () => {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ show,setshow]=useState(0);
  const [ordersData, setOrdersData] = useState<OrdersData>({
    preparing: [],
    outForDelivery: [],
    delivered: [],
  });
  // Dialog state for train details and delivery boys
  const [openTrainDialog, setOpenTrainDialog] = useState(false);
  const [openDeliveryDialog, setOpenDeliveryDialog] = useState(false);

  const dispatch = useDispatch();
  const location = useLocation();
  const userData = useSelector((state: RootState) => state?.auth?.userData);
const [isOnline,setonline]=useState<any>(null);

const [res_id,setresid]=useState<any>(null);
const fetchOrders = async () => {
  try {
    // Fetch restaurant info using vendor_id from Redux
    const res = await axiosInstance.get(`/restraunts/?vendor_id=${userData?.vendor_id}`);
    const restaurantRows = res?.data?.data?.rows;
    setresid(restaurantRows[0]?.res_id)
    setonline(restaurantRows[0]?.status)
    if (restaurantRows && restaurantRows.length > 0) {
      const res_id = restaurantRows[0]?.res_id;
      // Then, fetch orders for that restaurant
      const res1 = await axiosInstance.get(`/orders/?res_id=${res_id}`);
      const apiOrders = res1?.data?.data?.rows; // assuming this is an array
      
      // Mapping for payment mode
      const paymentModeMapping: { [key: number]: string } = {
        1: "Online",
        2: "COD",
      };

      // Transform API orders into UI-friendly format
      const transformedOrders: OrdersData = {
        preparing: [],
        outForDelivery: [],
        delivered: [],
      };

      if (Array.isArray(apiOrders)) {
        apiOrders.forEach((order: any) => {
          // Calculate time left using created_at and current time for preparing orders
          let timeLeftString = "";
          if (order.status === 1) {
            const orderCreationTime = new Date(order.created_at);
            const currentTime = new Date();
            const elapsedMinutes = (currentTime.getTime() - orderCreationTime.getTime()) / 60000;
            const preparationTime = 15; // set preparation time (in minutes)
            const remainingMinutes = Math.max(Math.ceil(preparationTime - elapsedMinutes), 0);
            timeLeftString = `${remainingMinutes} mins left`;
          }

          const transformedOrder: OrderUI = {
            id: order.oid ? order.oid.toString() : "",
            timeLeft: timeLeftString,
            items: order.menu_items?.items
              ? order.menu_items.items.map((item: any) => ({
                  name: item.name,
                  quantity: item.qty,
                  price: item.amount,
                }))
              : [],
            paymentMode: paymentModeMapping[order.mode] || "",
            total: order.amount,
            train_number:order.train_number,
            name:order.name,
            phone:order.phone,
            train_name:order.train_name,
            station_id:order.station_id
          };

          // Categorize order based on status (1: preparing, 2: out for delivery, 3: delivered)
          if (order.status === 1) {
            transformedOrders.preparing.push(transformedOrder);
          } else if (order.status === 2) {
            transformedOrders.outForDelivery.push(transformedOrder);
          } else if (order.status === 3) {
            transformedOrders.delivered.push(transformedOrder);
          }
        });
      }

      setOrdersData(transformedOrders);
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
};


  useEffect(() => {

    if (userData) {
      fetchOrders();
    }
  }, [userData]);


 const[traindet,settraindet]=useState<any>(null);

  const handleshowtrain = async(orderdet)=>{
    setOpenTrainDialog(true);
    try {
      const res = await axiosInstance.get(`/traindetail/${Number(orderdet?.train_number)}`);
      const thedata = res?.data?.trainRoutes?.find(route => route.stationId === orderdet.station_id);
      console.log(orderdet);
      settraindet({...thedata,orderdet})

    } catch (error) {
      
    }
  }

  console.log(traindet)
  const handlechangeonline =  async()=>{
    try {
      if(isOnline==1)
      {
        setonline(0);
        const res = await axiosInstance.put(`/restraunt/${res_id}`,{status:0});
        console.log(res?.data)
      }
      else{
        setonline(1);
        const res = await axiosInstance.put(`/restraunt/${res_id}`,{status:1});
        console.log(res?.data)
      }
     
    } catch (error) {
      
    }
  }
  return (
    <Box sx={{ width: '100%' }}>
      <Card
        sx={{
          overflow: "hidden",
          borderBottomLeftRadius: "30px",
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "10vh",
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
          boxShadow: 1,
          border: 'none',
          mb: 2,
          borderBottomRightRadius: "30px",
        }}
        variant="outlined"
      >
        <Stack direction="row" width="100%" justifyContent="space-between" px={2}>
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
              checked={isOnline==1 || false}
              onChange={handlechangeonline}
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
          <Stack direction="row" mx={2} gap={2}>
            <IconButton
              edge="end"
              onClick={() => setshow(1)}
              sx={{ bgcolor: '#EAE9ED', borderRadius: 2 }}
            >
              <BellIcon color="black" />
            </IconButton>
            <IconButton
              color="inherit"
              edge="end"
              onClick={() => setshow(2)}
              sx={{ bgcolor:'#EAE9ED', borderRadius: 2 }}
            >
              <WalletIcon color="black" />
            </IconButton>
            <IconButton
              color="inherit"
              edge="end"
              onClick={() => setDrawerOpen(true)}
              sx={{ bgcolor: '#EB8041', borderRadius: 2 }}
            >
              <MenuIcon color="white" />
            </IconButton>
          </Stack>
        </Stack>
      </Card>








{show==0?


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
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            },
            '& .MuiTabs-scroller': {
              '&::-webkit-scrollbar': {
                display: 'none',
              },
            },
          }}
        >
          {statusLabels.map((label, index) => (
            <Tab
              key={label}
              sx={{ fontFamily: "font-katibeh" }}
              label={<Chip label={`${label} (${ordersData[statusKeys[index]].length})`} />}
            />
          ))}
        </Tabs>

        {/* Order Cards */}
        <Box sx={{ mt: 2 }}>
          {ordersData[statusKeys[tabIndex]].length === 0 ? (
            <Typography fontFamily="font-katibeh" textAlign="center" color="text.secondary">
              No orders available
            </Typography>
          ) : (
            ordersData[statusKeys[tabIndex]].map((order) => (
              <Card key={order.id} sx={{ mb: 2, borderRadius: 3 }} variant="outlined">
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography fontFamily="font-katibeh" variant="subtitle2" color="text.secondary">
                      Order ID: <b>#{order.id}</b>
                    </Typography>
                    {order.timeLeft && (
                      <Chip
                        icon={<AccessTime fontSize="small" />}
                        label={order.timeLeft}
                        color="warning"
                        size="small"
                      />
                    )}
                  </Stack>

                  <Divider sx={{ my: 1 }} />
                  {order.items.map((item, index) => (
                    <Stack
                      key={index}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ py: 0.5 }}
                    >
                      <Typography fontFamily="font-katibeh">
                        {item.name} x {item.quantity}
                      </Typography>
                      <Typography fontFamily="font-katibeh" fontWeight="bold">
                        ₹{item.price}
                      </Typography>
                    </Stack>
                  ))}

                  <Divider sx={{ my: 1 }} />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography fontFamily="font-katibeh" variant="subtitle2" color="text.secondary">
                      Payment Mode: {order.paymentMode}
                    </Typography>
                    <Typography fontFamily="font-katibeh" fontWeight="bold" color="success.main">
                      ₹{order.total}
                    </Typography>
                  </Stack>

                  <Stack spacing={1} mt={2}>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        padding: 2,
                        bgcolor: '#FCE9E4',
                        color: '#D86E47',
                        '&:hover': { bgcolor: '#F5C6A5' },
                      }}
                      startIcon={<Visibility />}
                      onClick={() =>handleshowtrain(order)}
                    >
                      <Typography fontFamily="font-katibeh">View Train Details</Typography>
                    </Button>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ padding: 2, bgcolor: '#E87C4E', '&:hover': { bgcolor: '#D86E47' } }}
                      startIcon={<CheckCircle />}
                      onClick={() => setOpenDeliveryDialog(true)}
                    >
                      <Typography fontFamily="font-katibeh">Order Ready</Typography>
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      </Stack>
      :show==1?<Notification/>:<Wallet/>
}
      

      {/* Dialog for Train Details */}
      <Dialog open={openTrainDialog} onClose={() => setOpenTrainDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Train Details</DialogTitle>
        <DialogContent dividers>
          {/* Dummy train data */}
          <Stack spacing={1}>
            <Typography variant="body1">Train Name: {traindet?.orderdet?.train_name}</Typography>
            <Typography variant="body1">Train Number: {traindet?.orderdet?.train_number}</Typography>
            <Typography variant="body1">Departure Time: 10:00 AM</Typography>
            <Typography variant="body1">Platform: {traindet?.platform}</Typography>
            <Typography variant="body1">ETA: {traindet?.arrivalTime}</Typography>
            <Typography variant="body1">DTA: {traindet?.departureTime}</Typography>
            <Typography variant="body1">HALT TIME: {traindet?.haltTime}</Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTrainDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for Delivery Boys */}
      <Dialog open={openDeliveryDialog} onClose={() => setOpenDeliveryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delivery Boys</DialogTitle>
        <DialogContent dividers>
          {/* Dummy list of delivery boys */}
          <Stack spacing={1}>
            <Typography variant="body1">John Doe</Typography>
            <Typography variant="body1">Jane Smith</Typography>
            <Typography variant="body1">Bob Johnson</Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeliveryDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <DashboardDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </Box>
  );
};

export default Orders;
