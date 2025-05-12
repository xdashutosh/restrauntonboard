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
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Badge,
} from '@mui/material';
import { AccessTime, Visibility, CheckCircle, LocalShipping, DoneAll, Cancel } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import DashboardDrawer from '../../components/DashboardDrawer';
import { BellIcon, MenuIcon, WalletIcon } from 'lucide-react';
import axiosInstance from '../../interceptor/axiosInstance';
import Notification from './Notification';
import Wallet from './Wallet';

// Define interfaces for our data structure
interface MenuItem {
  name: string;
  item_id: number;
  quantity: number;
  descriptiom: string; // Note: this is misspelled in the API response
  SellingPrice: number;
  isVegetarian: boolean;
}

interface CustomerInfo {
  customerDetails: {
    mobile: string;
    customerName: string;
    alternateMobile: string;
  }
}

interface DeliveryDetails {
  deliveryDetails: {
    pnr: number;
    berth: string;
    coach: string;
    station: string;
    trainNo: string;
    stationCode: string;
    passengerCount: number;
  }
}

interface Order {
  oid: number;
  updated_at: string;
  pushed: number;
  updated_by: string;
  booked_from: string;
  menu_items: {
    items: MenuItem[];
  };
  customer_info: CustomerInfo;
  mode: string;
  created_at: string;
  delivery_date: string;
  status: string;
  discount_amount: number | null;
  irctc_discount: number | null;
  vendor_discount: number | null;
  delivery_details: DeliveryDetails;
  comment: string;
  outlet_id: number;
  outlet_name: string;
  gst: string;
  fssai: string;
  phone: string;
  fssai_valid: string;
  address: string;
  city: string;
  state: string;
  rlname: string;
  rlphone: string;
  rlemail: string;
  station_name: string;
  station_code: string;
  del_id?: number; // Delivery person ID if assigned
}

interface DeliveryPerson {
  del_id: number;
  name: string;
  phone: string;
  docs_exp: string;
  total_del: number;
  del_profile: string;
}

interface TrainDetails {
  platform: string;
  arrivalTime: string;
  departureTime: string;
  haltTime: string;
  orderDetails: Order;
}

interface Props {
  restdata: any;
}

// Status mappings
const STATUS_TYPES = {
  ORDER_PREPARING: 'Preparing',
  ORDER_PREPARED: 'Prepared',
  ORDER_OUT_FOR_DELIVERY: 'Out for Delivery',
  ORDER_DELIVERED: 'Delivered',
  ORDER_PARTIALLY_DELIVERED: 'Partially Delivered',
  ORDER_UNDELIVERED: 'Undelivered',
  ORDER_CANCELLED: 'Cancelled'
};

// Group statuses for tabs
const STATUS_GROUPS = {
  'Preparing': ['ORDER_PREPARING', 'ORDER_PREPARED'],
  'Out for Delivery': ['ORDER_OUT_FOR_DELIVERY'],
  'Delivered': ['ORDER_DELIVERED', 'ORDER_PARTIALLY_DELIVERED', 'ORDER_UNDELIVERED', 'ORDER_CANCELLED']
};

const Orders: React.FC<Props> = ({ restdata }) => {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [show, setShow] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [openTrainDialog, setOpenTrainDialog] = useState(false);
  const [openDeliveryDialog, setOpenDeliveryDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [trainDetails, setTrainDetails] = useState<TrainDetails | null>(null);
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [deldetails,setdeldetails]=useState<any>(null);
  // New state to store delivery person data for each order
  const [deliveryPersonsMap, setDeliveryPersonsMap] = useState<{[key: number]: DeliveryPerson}>({});

  const outletId = useSelector((state: RootState) => state.outlet_id);

  // Tab labels
  const statusLabels = Object.keys(STATUS_GROUPS);

  // Fetch orders from API
 // Modify the fetchOrders function to filter orders where pushed === 1
const fetchOrders = async () => {
  try {
    // Fetch restaurant info
    const res = await axiosInstance.get(`/restraunts/?outlet_id=${outletId?.outlet_id}`);
    const restaurantRows = res?.data?.data?.rows;
    
    if (restaurantRows && restaurantRows.length > 0) {
      
      // Fetch orders
      const res1 = await axiosInstance.get(`/orders/?outlet_id=${outletId?.outlet_id}`);
      const apiOrders = res1?.data?.data?.rows || [];
      
      // Filter orders where pushed === 1
      const filteredByPushed = apiOrders.filter(order => order.pushed === 1);
      
      // Sort orders by delivery date (closer dates first)
      const sortedOrders = [...filteredByPushed].sort((a, b) => {
        const dateA = new Date(a.delivery_date);
        const dateB = new Date(b.delivery_date);
        return dateA.getTime() - dateB.getTime();
      });
      
      setOrders(sortedOrders);
      filterOrdersByTab(tabIndex, sortedOrders);
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
};

  // Filter orders based on selected tab
  const filterOrdersByTab = (index: number, ordersList: Order[] = orders) => {
    const statusGroup = STATUS_GROUPS[statusLabels[index]];
    const filtered = ordersList.filter(order => statusGroup.includes(order.status));
    setFilteredOrders(filtered);
  };

  // Fetch delivery person by ID
  const fetchDeliveryPersonById = async (delId: number) => {
    try {
      const res = await axiosInstance.get(`/dels/?del_id=${delId}`);
      if (res?.data?.data?.rows && res.data.data.rows.length > 0) {
        const deliveryPerson = res.data.data.rows[0];
        setDeliveryPersonsMap(prevMap => ({
          ...prevMap,
          [delId]: deliveryPerson
        }));
      }
    } catch (error) {
      console.error("Error fetching delivery person:", error);
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchOrders();
    fetchDeliveryPersons();
  }, []);

  // Update filtered orders when tab changes
  useEffect(() => {
    filterOrdersByTab(tabIndex);
  }, [tabIndex, orders]);

  // Fetch delivery person data for orders with assigned delivery persons
  useEffect(() => {
    filteredOrders?.forEach(order => {
      if (order.del_id && !deliveryPersonsMap[order.del_id]) {
        fetchDeliveryPersonById(order.del_id);
      }
    });
  }, [filteredOrders]);

  // Fetch delivery persons
  const fetchDeliveryPersons = async () => {
    try {
      const res = await axiosInstance.get(`/dels/?outlet_id=${outletId?.outlet_id}`);
      if (res?.data?.data?.rows) {
        setDeliveryPersons(res.data.data.rows);
      }
    } catch (error) {
      console.error("Error fetching delivery persons:", error);
    }
  };

 

  // Show train details
  const handleShowTrain = async (order: any) => {
    console.log(order)
    setOpenTrainDialog(true);
    try {
      const res = await axiosInstance.get(`/traindetail/${order.delivery_details.deliveryDetails.trainNo}`);
      const thedata = res?.data?.trainRoutes?.find(
        (route: any) => route.stationCode == order.station_code
      );
      console.log(thedata)
      setTrainDetails({ 
        ...thedata, 
        orderDetails: order 
      });
    } catch (error) {
      console.error("Error fetching train details:", error);
    }
  };

  // Open status change dialog
  const handleOpenStatusDialog = (order: Order) => {
    setCurrentOrder(order);
    setNewStatus(order.status);
    setOpenStatusDialog(true);
  };


// Add a new function to push status to IRCTC
const pushStatusToIRCTC = async (orderId, status, orderItems, deliveryPerson) => {
  try {
    // Prepare orderItems in the required format
    const formattedItems = orderItems?.map(item => ({
      itemId: item.item_id,
      quantity: item.quantity
    }));
    
    // Create the payload
    const payload:any = {
      status: status,
      otp: "1234",
      orderItems: formattedItems,
      deliveryPersonContactNo: null,
      deliveryPersonName: null
    };
    
    // Add remarks only for ORDER_UNDELIVERED or ORDER_CANCELLED
    if (status === "ORDER_UNDELIVERED" || status === "ORDER_CANCELLED") {
      payload.remarks = "LAW_N_ORDER";
    }
    
    // Add delivery person details if available
    if (deliveryPerson) {
      payload.deliveryPersonContactNo = deliveryPerson.phone;
      payload.deliveryPersonName = deliveryPerson.name;
    }
    
    // Make the API call
    const response = await axiosInstance.post(`/push-status/${orderId}`, payload);
    return response.data;
  } catch (error) {
    console.error("Error pushing status to IRCTC:", error);
    throw error;
  }
};

  // Handle status change
  // Handle status change
const handleStatusChange = async (status: string) => {
  if (!currentOrder) return;
  
  try {
    // If changing to out for delivery, open delivery assignment dialog
    if (status === 'ORDER_OUT_FOR_DELIVERY') {
      setOpenStatusDialog(false);
      setOpenDeliveryDialog(true);
      return;
    }
    
    // First push the status to IRCTC
    await pushStatusToIRCTC(
      currentOrder.oid, 
      status, 
      currentOrder.menu_items.items,
      currentOrder.del_id ? deliveryPersonsMap[currentOrder.del_id] : null
    );
    
    // Then update order status in our database
    await axiosInstance.put(`/order/${currentOrder.oid}`, { status });
    setOpenStatusDialog(false);
    fetchOrders();
  } catch (error) {
    console.error("Error updating order status:", error);
  }
};

// Assign delivery person
const handleAssignDelivery = async (delId: number, person: any) => {
  if (!currentOrder) return;
  
  try {
    setdeldetails(person);
    
    // First push the status to IRCTC
    await pushStatusToIRCTC(
      currentOrder.oid,
      'ORDER_OUT_FOR_DELIVERY',
      currentOrder.menu_items.items,
      person // Pass the full delivery person object
    );
    
    // Then update our database
    await axiosInstance.put(`/order/${currentOrder.oid}`, { 
      del_id: delId, 
      status: 'ORDER_OUT_FOR_DELIVERY' 
    });
    
    setOpenDeliveryDialog(false);
    fetchOrders();
  } catch (error) {
    console.error("Error assigning delivery person:", error);
  }
};

 

  // Calculate time left for train arrival
  const getTimeLeft = (arrivalTime: string): string => {
    if (!arrivalTime) return "Unknown";
    
    const minutes = getMinutesLeft(arrivalTime);
    
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}:${mins.toString().padStart(2, '0')} hrs`;
    }
    
    if (minutes > 0) {
      return `${minutes} min`;
    }
    
    return "Arriving";
  };
  
  const getMinutesLeft = (arrivalTime: string): number => {
    if (!arrivalTime) return 0;
    
    // Parse the arrival time
    const [hours, mins] = arrivalTime.split(':').map(Number);
    
    // Get current time
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    
    // Calculate total minutes for both times
    const arrivalTotalMinutes = (hours * 60) + mins;
    const currentTotalMinutes = (currentHours * 60) + currentMinutes;
    
    // Calculate difference considering 24-hour cycle
    let minutesDifference = arrivalTotalMinutes - currentTotalMinutes;
    
    // If arrival time is earlier in the day than current time, it means arrival is tomorrow
    if (minutesDifference < 0) {
      minutesDifference += 24 * 60; // Add 24 hours in minutes
    }
    
    return minutesDifference;
  };
  
function formatDate(dateStr) {
  // Split the input date string by the hyphen
  const [year, month, day] = dateStr.split('-');
  
  // Rearrange and join with hyphens to get DD-MM-YYYY format
  return `${day}-${month}-${year}`;
}
  // Format delivery date for display
  const formatDeliveryDate = (dateString: string) => {
    const datepart = dateString.split(" ")[0];
    console.log(datepart)
  return  `${formatDate(datepart)} At ${dateString.split(" ")[1]}`
  
  };
  
  

 function standardizeDateTime(dateTimeStr: string): string {
  // Parse the format "YYYY-MM-DD HH:MM IST"
  const regex = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}) IST$/;
  const match = dateTimeStr.match(regex);
  
  if (!match) {
    throw new Error("Invalid date format. Expected: YYYY-MM-DD HH:MM IST");
  }
  
  const [_, year, month, day, hour, minute] = match;
  
  // IST is UTC+5:30, so we add this offset to create an ISO string
  // Format: YYYY-MM-DDTHH:MM:SS+05:30
  return `${year}-${month}-${day}T${hour}:${minute}:00+05:30`;
}

// Modified getDeliveryTimeLeft function
const getDeliveryTimeLeft = (deliveryDate: string) => {
  // First standardize the date format
  let standardDate;
  try {
    // Check if the date is in IST format
    if (deliveryDate.includes('IST')) {
      standardDate = standardizeDateTime(deliveryDate);
    } else {
      standardDate = deliveryDate;
    }
    
    const now = new Date();
    const delivery = new Date(standardDate);
    
    const diffMs = delivery.getTime() - now.getTime();
    
    if (diffMs <= 0) return "Due now";
    
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} min left`;
    } else if (diffMins < 1440) { // less than a day
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins}m left`;
    } else {
      const days = Math.floor(diffMins / 1440);
      return `${days} day${days > 1 ? 's' : ''} left`;
    }
  } catch (error) {
    console.error("Date parsing error:", error);
    return "Invalid date format";
  }
};

  // Get status icon based on status
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'ORDER_PREPARING':
        return <AccessTime fontSize="small" />;
      case 'ORDER_PREPARED':
        return <CheckCircle fontSize="small" />;
      case 'ORDER_OUT_FOR_DELIVERY':
        return <LocalShipping fontSize="small" />;
      case 'ORDER_DELIVERED':
        return <DoneAll fontSize="small" />;
      case 'ORDER_CANCELLED':
        return <Cancel fontSize="small" />;
      default:
        return <AccessTime fontSize="small" />;
    }
  };

  // Calculate total order count per tab
  const getOrderCountByTab = (index: number) => {
    const statusGroup = STATUS_GROUPS[statusLabels[index]];
    return orders.filter(order => statusGroup.includes(order.status)).length;
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
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
        <Stack direction="row" width="100%" justifyContent="end" px={2}>
       
          <Stack direction="row" mx={2} gap={2}>
            <IconButton
              edge="end"
              onClick={() => setShow(1)}
              sx={{ bgcolor: '#EAE9ED', borderRadius: 2 }}
            >
              <Badge badgeContent={4} color="error">
                <BellIcon color="black" />
              </Badge>
            </IconButton>
            <IconButton
              edge="end"
              onClick={() => setShow(2)}
              sx={{ bgcolor: '#EAE9ED', borderRadius: 2 }}
            >
              <WalletIcon color="black" />
            </IconButton>
            <IconButton
              edge="end"
              onClick={() => setDrawerOpen(true)}
              sx={{ bgcolor: '#EB8041', borderRadius: 2 }}
            >
              <MenuIcon color="white" />
            </IconButton>
          </Stack>
        </Stack>
      </Card>

      {show === 0 ? (
        <Stack px={2}>
          {/* Tab Navigation */}
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
                label={
                  <Chip 
                    label={`${label} (${getOrderCountByTab(index)})`} 
                    color={index === tabIndex ? "primary" : "default"}
                  />
                }
              />
            ))}
          </Tabs>

          {/* Order Cards */}
          <Box sx={{ mt: 2 }}>
            {filteredOrders.length === 0 ? (
              <Typography fontFamily="font-katibeh" textAlign="center" color="text.secondary">
                No orders available
              </Typography>
            ) : (
              filteredOrders?.map((order) => (
                <Card key={order.oid} sx={{ mb: 2, borderRadius: 3 }} variant="outlined">
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography fontFamily="font-katibeh" variant="subtitle2" color="text.secondary">
                        Order ID: <b>#{order.oid}</b>
                      </Typography>
                      <Chip
                        icon={getStatusIcon(order.status)}
                        label={STATUS_TYPES[order.status as keyof typeof STATUS_TYPES]}
                        color={
                          order.status === 'ORDER_CANCELLED' ? 'error' :
                          order.status === 'ORDER_DELIVERED' ? 'success' :
                          order.status === 'ORDER_OUT_FOR_DELIVERY' ? 'primary' : 'warning'
                        }
                        size="small"
                      />
                    </Stack>

                    <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
                      <Typography fontFamily="font-katibeh" variant="body2">
                        {order.customer_info.customerDetails.customerName} • {order.customer_info.customerDetails.mobile}
                      </Typography>
                      <Chip 
                        icon={<AccessTime fontSize="small" />}
                        label={getDeliveryTimeLeft(order.delivery_date)}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                    
                    <Typography fontFamily="font-katibeh" variant="caption" color="text.secondary">
                      Delivery: {formatDeliveryDate(order.delivery_date)}
                    </Typography>

                    {/* Delivery Person Info - Display when available */}
                    {order.del_id && deliveryPersonsMap[order.del_id] && (
                      <Box sx={{ mt: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar 
                            src={deliveryPersonsMap[order.del_id].del_profile} 
                            alt={deliveryPersonsMap[order.del_id].name}
                            sx={{ width: 32, height: 32 }}
                          />
                          <Box>
                            <Typography fontFamily="font-katibeh" variant="body2" fontWeight="bold">
                              Delivery: {deliveryPersonsMap[order.del_id].name}
                            </Typography>
                            <Typography fontFamily="font-katibeh" variant="caption">
                              {deliveryPersonsMap[order.del_id].phone}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    )}

                    <Divider sx={{ my: 1 }} />
                    {order.menu_items.items.map((item, index) => (
                      <Stack
                        key={index}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ py: 0.5 }}
                      >
                        <Box>
                          <Typography fontFamily="font-katibeh">
                            {item.name} x {item.quantity}
                          </Typography>
                          {item.isVegetarian && (
                            <Chip label="Veg" size="small" color="success" sx={{ mr: 1, height: 20 }} />
                          )}
                        </Box>
                        <Typography fontFamily="font-katibeh" fontWeight="bold">
                          ₹{item.SellingPrice * item.quantity}
                        </Typography>
                      </Stack>
                    ))}

                    {order.comment && (
                      <Typography fontFamily="font-katibeh" variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        <b>Note:</b> {order.comment}
                      </Typography>
                    )}

                    <Divider sx={{ my: 1 }} />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontFamily="font-katibeh" variant="subtitle2" color="text.secondary">
                        Payment: {order.mode}
                      </Typography>
                      <Typography fontFamily="font-katibeh" fontWeight="bold" color="success.main">
                        ₹{order.menu_items.items.reduce((total, item) => total + (item.SellingPrice * item.quantity), 0)}
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
                        onClick={() => handleShowTrain(order)}
                      >
                        <Typography fontFamily="font-katibeh">View Train Details</Typography>
                      </Button>
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{ padding: 2, bgcolor: '#E87C4E', '&:hover': { bgcolor: '#D86E47' } }}
                        startIcon={<CheckCircle />}
                        onClick={() => handleOpenStatusDialog(order)}
                      >
                        <Typography fontFamily="font-katibeh">Update Status</Typography>
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        </Stack>
      ) : show === 1 ? (
        <Notification />
      ) : (
        <Wallet />
      )}

      {/* Dialog for Train Details */}
      <Dialog open={openTrainDialog} onClose={() => setOpenTrainDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Train Details</DialogTitle>
        <DialogContent dividers>
          {trainDetails && (
            <Stack spacing={1}>
              {getMinutesLeft(trainDetails.arrivalTime) > 0 && (
                <Chip
                  icon={<AccessTime fontSize="large" />}
                  label={`${getTimeLeft(trainDetails.arrivalTime)} left`}
                  color="warning"
                  size="small"
                />
              )}
              
              <Typography variant="body1">
                Train Name: {trainDetails.orderDetails.delivery_details.deliveryDetails.trainNo}
              </Typography>
              <Typography variant="body1">
                Train Number: {trainDetails.orderDetails.delivery_details.deliveryDetails.trainNo}
              </Typography>
              <Typography variant="body1">
                Platform: {trainDetails.platform || 'Not assigned yet'}
              </Typography>
              <Typography variant="body1">
                ETA: {trainDetails.arrivalTime || 'Not available'}
              </Typography>
              <Typography variant="body1">
                DTA: {trainDetails.departureTime || 'Not available'}
              </Typography>
              <Typography variant="body1">
                HALT TIME: {trainDetails.haltTime || 'Not available'}
              </Typography>
              
              <Divider sx={{ my: 1 }} />
              
              <Typography variant="subtitle1" fontWeight="bold">
                Passenger Details
              </Typography>
              <Typography variant="body2">
                Coach: {trainDetails.orderDetails.delivery_details.deliveryDetails.coach}
              </Typography>
              <Typography variant="body2">
                Berth: {trainDetails.orderDetails.delivery_details.deliveryDetails.berth}
              </Typography>
              <Typography variant="body2">
                PNR: {trainDetails.orderDetails.delivery_details.deliveryDetails.pnr}
              </Typography>
              <Typography variant="body2">
                Passengers: {trainDetails.orderDetails.delivery_details.deliveryDetails.passengerCount}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTrainDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for Status Change */}
      <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="ORDER_PREPARING">Preparing</MenuItem>
              <MenuItem value="ORDER_PREPARED">Prepared</MenuItem>
              <MenuItem value="ORDER_OUT_FOR_DELIVERY">Out for Delivery</MenuItem>
              <MenuItem value="ORDER_DELIVERED">Delivered</MenuItem>
              <MenuItem value="ORDER_PARTIALLY_DELIVERED">Partially Delivered</MenuItem>
              <MenuItem value="ORDER_UNDELIVERED">Undelivered</MenuItem>
              <MenuItem value="ORDER_CANCELLED">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStatusDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => handleStatusChange(newStatus)}
            variant="contained" 
            color="primary"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for Delivery Boys */}
      <Dialog open={openDeliveryDialog} onClose={() => setOpenDeliveryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Select Delivery Person</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {deliveryPersons.length === 0 ? (
              <Typography>No delivery persons available</Typography>
            ) : (
              deliveryPersons.map((person) => (
                <Card
                  key={person.del_id}
                  sx={{
                    display: 'flex',
                    p: 2,
                    justifyContent: 'space-between',
                    gap: 1,
                    flexDirection: { xs: 'row', sm: 'row' },
                  }}
                >
                  <Avatar
                    src={person.del_profile}
                    alt={person.name}
                    sx={{ height: 50, width: 50, objectFit: 'contain' }}
                  />
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
                        {person.name}
                      </Typography>
                      <Typography variant="body2">{person.phone}</Typography>
                      <Typography variant="body2">Pass Expiry: {person.docs_exp}</Typography>
                      <Typography variant="body2">Deliveries: {person.total_del}</Typography>
                    </Box>
                    <Button 
                      sx={{ mt: 2 }} 
                      variant="contained"
                      onClick={() => handleAssignDelivery(person.del_id,person)}
                    >
                      Assign
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeliveryDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <DashboardDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </Box>
  );
};

export default Orders;