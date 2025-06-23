import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  Divider,
  IconButton,
  Paper,
  useTheme,
  useMediaQuery,
  Avatar,
  LinearProgress,
  Chip,
  Button
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import {
  Star,
  KeyboardArrowDown,
  TrendingUp,
  People,
  LocalDining,
  Restaurant,
  DateRange,
  RestaurantMenu,
} from "@mui/icons-material";
import {
  CoinsIcon,
  MapPinIcon,
  Clock,
  ShoppingBag,
  Activity,
  Users
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import axiosInstance from "../../interceptor/axiosInstance";
import { useNavigate } from "react-router-dom";

// --- DUMMY DATA (as in original code) ---

// Define revenue data with 5-day intervals
const revenueData = [
  { name: "1-5", value: 18000 },
  { name: "5-10", value: 12000 },
  { name: "10-15", value: 6000 },
  { name: "15-20", value: 4000 },
  { name: "20-25", value: 15000 },
  { name: "25-30", value: 20000 },
];

// Sales breakdown data for pie chart
const salesBreakdownData = [
  { name: "Starters", value: 34 },
  { name: "Main Course", value: 45 },
  { name: "Desserts", value: 13 },
  { name: "Beverages", value: 8 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// --- COMPONENT START ---

interface Props {
  restdata: any;
}

const Home: React.FC<Props> = ({ restdata }) => {
  const [station, setStation] = useState(null);
  const [todayOrders, setTodayOrders] = useState<any>(null);
  const [totalAmount, setTotalAmount] = useState<any>(null);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();

  useEffect(() => {
    const getdata = async () => {
      try {
        if (!restdata) return;
        const res = await axiosInstance.get(`/stations/?station_code=${restdata.station_code}`);
        setStation(res?.data?.data?.rows[0]?.station_name);

        const res1 = await axiosInstance.get(`/orders/?outlet_id=${restdata.outlet_id}`);
        const apiOrders = res1?.data?.data?.rows || [];

        const todayISO = new Date().toISOString().slice(0, 10);
        const todaysOrders = apiOrders.filter(order =>
          order.created_at.slice(0, 10) === todayISO
        );

        setTodayOrders(todaysOrders.length);

        const totalAmount = todaysOrders.reduce(
          (sum, order) => sum + (Number(order.amount) || 0),
          0
        );
        setTotalAmount(totalAmount);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    if (restdata) {
      getdata();
    }
  }, [restdata]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const currentDate = new Date();
  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(currentDate);

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <Box sx={{ width: "100%", bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Restaurant Header */}
      <Card
        elevation={0}
        sx={{
          overflow: "hidden",
          borderRadius: 0,
          borderBottomLeftRadius: "24px",
          borderBottomRightRadius: "24px",
          background: `linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.7)), url(${restdata?.logo_image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: isDesktop ? "20vh" : "25vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          width: "100%",
          p: isDesktop ? 4 : 2,
        }}
      >
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Stack>
                <Typography variant={isDesktop ? "h4" : "h5"} fontWeight={700} sx={{ textShadow: "0px 1px 3px rgba(0,0,0,0.8)", color: 'white' }}>
                    {restdata?.outlet_name}
                </Typography>
                <Button 
                    variant="outlined" 
                    size="small"
                    onClick={()=>navigate(`/outlets/${restdata?.vendor_id}`)}
                    sx={{
                        mt: 1,
                        color: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        width: 'fit-content',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'white',
                        }
                    }}
                >
                    Switch Outlet
                </Button>
            </Stack>
            <Chip
              icon={<Star sx={{ color: "white !important", fontSize: 16 }} />}
              label="4.5"
              size="small"
              sx={{ bgcolor: "#EB8041", color: "white", fontWeight: 600, '& .MuiChip-icon': { color: 'white' } }}
            />
          </Stack>

          <Stack direction="row" spacing={3} alignItems="center" color="white">
            <Stack direction="row" spacing={1} alignItems="center">
              <MapPinIcon size={16} />
              <Typography variant="body2">
                Station: <strong>{restdata?.station_name || station}</strong>
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Clock size={16} />
              <Typography variant="body2">
                <strong>{formatTime(restdata?.opening_time)} - {formatTime(restdata?.closing_time)}</strong>
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
              <DateRange fontSize="small" />
              <Typography variant="body2">
                <strong>{formattedDate}</strong>
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Card>

      <Box sx={{ px: isDesktop ? 4 : 2, maxWidth: "100%", pb: 4, mt: 3 }}>
        {/* --- DESKTOP: 4-COLUMN STATS BAR --- */}
        <Grid container spacing={isDesktop ? 3 : 2} sx={{ mb: 3 }}>
          {/* Today's Revenue */}
          <Grid item xs={6} md={3}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 3, background: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)" }}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar sx={{ bgcolor: "#1976D2", width: 40, height: 40 }}><CoinsIcon size={20} color="white" /></Avatar>
                  <Typography variant="body1" fontWeight={500} color="text.secondary">Today's Revenue</Typography>
                </Stack>
                <Typography variant="h5" fontWeight={700} color="#1976D2">{formatCurrency(totalAmount)}</Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <TrendingUp fontSize="small" sx={{ color: "success.main" }} />
                  <Typography variant="caption" fontWeight={600} color="success.main">+12% from yesterday</Typography>
                </Stack>
              </Stack>
            </Card>
          </Grid>
          {/* Today's Orders */}
          <Grid item xs={6} md={3}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 3, background: "linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)" }}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar sx={{ bgcolor: "#FF8F00", width: 40, height: 40 }}><ShoppingBag size={20} color="white" /></Avatar>
                  <Typography variant="body1" fontWeight={500} color="text.secondary">Today's Orders</Typography>
                </Stack>
                <Typography variant="h5" fontWeight={700} color="#FF8F00">{todayOrders || 0}</Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <TrendingUp fontSize="small" sx={{ color: "success.main" }} />
                  <Typography variant="caption" fontWeight={600} color="success.main">+40% from yesterday</Typography>
                </Stack>
              </Stack>
            </Card>
          </Grid>
          {/* Average Order Value (AOV) - New for Desktop */}
          <Grid item xs={6} md={3}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 3, background: "linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)" }}>
                <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ bgcolor: "#8E24AA", width: 40, height: 40 }}><RestaurantMenu sx={{color: "white"}} /></Avatar>
                        <Typography variant="body1" fontWeight={500} color="text.secondary">Avg. Order Value</Typography>
                    </Stack>
                    <Typography variant="h5" fontWeight={700} color="#8E24AA">{formatCurrency(815)}</Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <TrendingUp fontSize="small" sx={{ color: "success.main" }} />
                        <Typography variant="caption" fontWeight={600} color="success.main">+8% from yesterday</Typography>
                    </Stack>
                </Stack>
            </Card>
          </Grid>
          {/* Total Customers - New for Desktop */}
          <Grid item xs={6} md={3}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 3, background: "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)" }}>
                <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ bgcolor: "#388E3C", width: 40, height: 40 }}><Users size={20} color="white" /></Avatar>
                        <Typography variant="body1" fontWeight={500} color="text.secondary">New Customers</Typography>
                    </Stack>
                    <Typography variant="h5" fontWeight={700} color="#388E3C">12</Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <TrendingUp fontSize="small" sx={{ color: "success.main" }} />
                        <Typography variant="caption" fontWeight={600} color="success.main">+5 today</Typography>
                    </Stack>
                </Stack>
            </Card>
          </Grid>
        </Grid>

        {/* --- MAIN DASHBOARD AREA --- */}
        <Grid container spacing={isDesktop ? 3 : 2}>
            {/* Left Column: Main Chart */}
            <Grid item xs={12} md={8}>
                <Card elevation={0} sx={{ borderRadius: 3, overflow: "hidden", height: '100%' }}>
                    <Box sx={{ p: 2.5, pb: 0 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Avatar sx={{ bgcolor: "#E8F5E9", mr: 1.5 }}><Activity size={20} color="#2E7D32" /></Avatar>
                                <Typography variant="h6" fontWeight={600}>Monthly Revenue</Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", bgcolor: "#F5F5F5", borderRadius: 2, px: 1, py: 0.5, cursor: 'pointer' }}>
                                <Typography variant="caption" fontWeight={500}>February</Typography>
                                <KeyboardArrowDown fontSize="small" />
                            </Box>
                        </Stack>
                        <Typography variant="h4" fontWeight={700}>
                            {formatCurrency(78500)}
                            <Typography component="span" variant="body2" fontWeight={600} color="success.main" sx={{ ml: 1 }}>+12%</Typography>
                        </Typography>
                        <Box sx={{ mt: 1, mb: 2 }}>
                            <LinearProgress variant="determinate" value={75} sx={{ height: 6, borderRadius: 3, bgcolor: "#E0E0E0", '& .MuiLinearProgress-bar': { bgcolor: "#2E7D32" } }} />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>75% of monthly target ({formatCurrency(105000)})</Typography>
                        </Box>
                    </Box>
                    <ResponsiveContainer width="100%" height={isDesktop ? 350 : 200}>
                        <BarChart data={revenueData} margin={{ top: 5, right: 30, left: 0, bottom: 20 }} barGap={8}>
                            <defs><linearGradient id="gradientBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4CAF50" stopOpacity={1} /><stop offset="100%" stopColor="#81C784" stopOpacity={0.8} /></linearGradient></defs>
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#666' }} axisLine={false} tickLine={false} label={{ value: 'Days of the Month', position: 'insideBottom', offset: -10, fontSize: 12 }} />
                            <YAxis tickFormatter={val => formatCurrency(val / 1000) + 'k'} tick={{ fontSize: 12, fill: '#666' }} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} formatter={(value) => [formatCurrency(value as number), "Revenue"]} />
                            <Bar dataKey="value" fill="url(#gradientBar)" radius={[4, 4, 0, 0]} barSize={isDesktop ? 30 : 20} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </Grid>
            
            {/* Right Column: Side Cards */}
            <Grid item xs={12} md={4}>
                <Stack spacing={isDesktop ? 3 : 2}>
                    {/* Popular Categories */}
                    <Card elevation={0} sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
                                <Avatar sx={{ bgcolor: "#E0F7FA", mr: 1.5 }}><Restaurant sx={{ color: "#00ACC1" }} /></Avatar>
                                <Typography variant="h6" fontWeight={600}>Popular Categories</Typography>
                            </Stack>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie data={salesBreakdownData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                                        {salesBreakdownData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value}%`, 'Sales']} />
                                    <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: "14px"}}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Sales Overview */}
                    <Card elevation={0} sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
                                <Avatar sx={{ bgcolor: "#EDE7F6", mr: 1.5 }}><LocalDining sx={{ color: "#673AB7" }} /></Avatar>
                                <Typography variant="h6" fontWeight={600}>Sales Details</Typography>
                            </Stack>
                            <Stack spacing={2.5}>
                                <Box>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2" color="text.secondary">Sales from Offers</Typography>
                                        <Typography variant="subtitle2" fontWeight={700}>{formatCurrency(8250)}
                                            <Typography component="span" variant="caption" fontWeight={600} color="success.main" sx={{ ml: 0.5 }}>+12%</Typography>
                                        </Typography>
                                    </Stack>
                                    <LinearProgress variant="determinate" value={65} sx={{ height: 5, borderRadius: 2, mt: 1, bgcolor: "#E0E0E0", '& .MuiLinearProgress-bar': { bgcolor: "#673AB7" } }}/>
                                </Box>
                                <Divider />
                                <Box>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2" color="text.secondary">Total Orders (Month)</Typography>
                                        <Typography variant="subtitle2" fontWeight={700}>240
                                            <Typography component="span" variant="caption" fontWeight={600} color="success.main" sx={{ ml: 0.5 }}>+40%</Typography>
                                        </Typography>
                                    </Stack>
                                    <LinearProgress variant="determinate" value={85} sx={{ height: 5, borderRadius: 2, mt: 1, bgcolor: "#E0E0E0", '& .MuiLinearProgress-bar': { bgcolor: "#673AB7" } }}/>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Stack>
            </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Home;