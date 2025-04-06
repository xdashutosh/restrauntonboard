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
  Chip
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
  Cell
} from "recharts";
import { 
  Star, 
  KeyboardArrowDown, 
  TrendingUp, 
  People, 
  LocalDining,
  Restaurant,
  DateRange
} from "@mui/icons-material";
import { 
  CoinsIcon, 
  TrendingUpIcon, 
  MapPinIcon, 
  Clock, 
  ShoppingBag,
  Activity
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import axiosInstance from "../../interceptor/axiosInstance";

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

interface Props {
  restdata: any;
}

const Home: React.FC<Props> = ({ restdata }) => {
  const [station, setStation] = useState(null);
  const [todayOrders, setTodayOrders] = useState<any>(null);
  const [totalAmount, setTotalAmount] = useState<any>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  useEffect(() => {
    const getdata = async () => {
      try {
        const res = await axiosInstance.get(`/stations/?station_id=${restdata?.station_id}`);
        setStation(res?.data?.data?.rows[0]?.station_name);
        
        const res1 = await axiosInstance.get(`/orders/?res_id=${restdata?.res_id}`);
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
    getdata();
  }, [restdata]);

  const formatCurrency = (amount) => {
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
          background: `linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.7)), 
                 url(${restdata?.media_url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "25vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          width: "100%",
        }}
      >
        <CardContent sx={{ color: "white" }}>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Typography variant="h5" fontWeight={700} sx={{ textShadow: "0px 1px 3px rgba(0,0,0,0.8)" }}>
                {restdata?.name}
              </Typography>
              <Chip
                icon={<Star sx={{ color: "white !important", fontSize: 16 }} />}
                label="4.5"
                size="small"
                sx={{
                  bgcolor: "#EB8041",
                  color: "white",
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    color: 'white'
                  }
                }}
              />
            </Stack>
            
            <Stack direction="row" spacing={1} alignItems="center">
              <MapPinIcon size={16} />
              <Typography variant="body2">
                Station: <strong>{station}</strong>
              </Typography>
            </Stack>
            
            <Stack direction="row" spacing={2} alignItems="center">
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Clock size={16} />
                <Typography variant="body2">
                  <strong>9:00 AM - 10:00 PM</strong>
                </Typography>
              </Stack>
              
              <Stack direction="row" spacing={0.5} alignItems="center">
                <DateRange fontSize="small" />
                <Typography variant="body2">
                  <strong>{formattedDate.split(',')[0]}</strong>
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ px: 2, maxWidth: "100%", pb: 4, mt: 2 }}>
        {/* Summary Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Card
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                height: "100%",
                background: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
              }}
            >
              <Stack spacing={1}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Avatar sx={{ bgcolor: "#1976D2", width: 36, height: 36, mr: 1 }}>
                    <CoinsIcon size={20} color="white" />
                  </Avatar>
                  <Typography variant="body2" fontWeight={500} color="text.secondary">
                    Today's Revenue
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight={700} color="#1976D2">
                  {formatCurrency(totalAmount)}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <TrendingUp fontSize="small" sx={{ color: "success.main" }} />
                  <Typography variant="caption" fontWeight={600} color="success.main">
                    +12% from yesterday
                  </Typography>
                </Stack>
              </Stack>
            </Card>
          </Grid>
          
          <Grid item xs={6}>
            <Card
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                height: "100%",
                background: "linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)",
              }}
            >
              <Stack spacing={1}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Avatar sx={{ bgcolor: "#FF8F00", width: 36, height: 36, mr: 1 }}>
                    <ShoppingBag size={20} color="white" />
                  </Avatar>
                  <Typography variant="body2" fontWeight={500} color="text.secondary">
                    Today's Orders
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight={700} color="#FF8F00">
                  {todayOrders || 0}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <TrendingUp fontSize="small" sx={{ color: "success.main" }} />
                  <Typography variant="caption" fontWeight={600} color="success.main">
                    +40% from yesterday
                  </Typography>
                </Stack>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        {/* Monthly Revenue Chart */}
        <Card 
          elevation={0}
          sx={{ 
            mb: 3, 
            borderRadius: 3,
            overflow: "hidden"
          }}
        >
          <Box sx={{ px: 2, pt: 2, pb: 0 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar sx={{ bgcolor: "#E8F5E9", mr: 1.5 }}>
                  <Activity size={20} color="#2E7D32" />
                </Avatar>
                <Typography variant="subtitle1" fontWeight={600}>
                  Monthly Revenue
                </Typography>
              </Box>
              <Box sx={{ 
                display: "flex", 
                alignItems: "center", 
                bgcolor: "#F5F5F5", 
                borderRadius: 2,
                px: 1,
                py: 0.5
              }}>
                <Typography variant="caption" fontWeight={500}>
                  February
                </Typography>
                <KeyboardArrowDown fontSize="small" />
              </Box>
            </Stack>
            
            <Typography variant="h4" fontWeight={700}>
              {formatCurrency(32600)}
              <Typography component="span" variant="body2" fontWeight={600} color="success.main" sx={{ ml: 1 }}>
                +12%
              </Typography>
            </Typography>
            
            <Box sx={{ mt: 1, mb: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={75} 
                sx={{ 
                  height: 6, 
                  borderRadius: 3,
                  bgcolor: "#E0E0E0",
                  '& .MuiLinearProgress-bar': {
                    bgcolor: "#2E7D32",
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                75% of monthly target
              </Typography>
            </Box>
          </Box>
          
          <ResponsiveContainer width="100%" height={180}>
            <BarChart 
              data={revenueData} 
              margin={{ top: 0, right: 10, left: 10, bottom: 20 }}
              barSize={isMobile ? 20 : 30}
            >
              <defs>
                <linearGradient id="gradientBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4CAF50" stopOpacity={1} />
                  <stop offset="100%" stopColor="#81C784" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: "rgba(0,0,0,0.05)" }}
                contentStyle={{ 
                  borderRadius: 8, 
                  border: "none", 
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)" 
                }}
                formatter={(value) => [formatCurrency(value), "Revenue"]}
              />
              <Bar 
                dataKey="value" 
                fill="url(#gradientBar)" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Sales Overview */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 3,
                height: "100%",
              }}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar sx={{ bgcolor: "#EDE7F6", mr: 1.5 }}>
                      <LocalDining sx={{ color: "#673AB7" }} />
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Sales Overview
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    bgcolor: "#F5F5F5", 
                    borderRadius: 2,
                    px: 1,
                    py: 0.5
                  }}>
                    <Typography variant="caption" fontWeight={500}>
                      February
                    </Typography>
                    <KeyboardArrowDown fontSize="small" />
                  </Box>
                </Stack>
                
                <Stack spacing={2}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Sales from Offers
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {formatCurrency(8250)}
                        <Typography component="span" variant="caption" fontWeight={600} color="success.main" sx={{ ml: 0.5 }}>
                          +12%
                        </Typography>
                      </Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={65} 
                      sx={{ 
                        height: 4, 
                        borderRadius: 2,
                        mt: 1,
                        bgcolor: "#E0E0E0",
                        '& .MuiLinearProgress-bar': {
                          bgcolor: "#673AB7",
                        }
                      }}
                    />
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Number of Orders
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={700}>
                        40
                        <Typography component="span" variant="caption" fontWeight={600} color="success.main" sx={{ ml: 0.5 }}>
                          +40%
                        </Typography>
                      </Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={85} 
                      sx={{ 
                        height: 4, 
                        borderRadius: 2,
                        mt: 1,
                        bgcolor: "#E0E0E0",
                        '& .MuiLinearProgress-bar': {
                          bgcolor: "#673AB7",
                        }
                      }}
                    />
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Average Order Value
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {formatCurrency(815)}
                        <Typography component="span" variant="caption" fontWeight={600} color="success.main" sx={{ ml: 0.5 }}>
                          +8%
                        </Typography>
                      </Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={72} 
                      sx={{ 
                        height: 4, 
                        borderRadius: 2,
                        mt: 1,
                        bgcolor: "#E0E0E0",
                        '& .MuiLinearProgress-bar': {
                          bgcolor: "#673AB7",
                        }
                      }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 3,
                height: "100%",
              }}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar sx={{ bgcolor: "#E0F7FA", mr: 1.5 }}>
                      <Restaurant sx={{ color: "#00ACC1" }} />
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Popular Categories
                    </Typography>
                  </Box>
                </Stack>
                
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 2 }}>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={salesBreakdownData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {salesBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Sales Percentage']} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                
                <Box sx={{ mt: 1 }}>
                  <Grid container spacing={1}>
                    {salesBreakdownData.map((item, index) => (
                      <Grid item xs={6} key={index}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box 
                            sx={{ 
                              width: 12, 
                              height: 12, 
                              borderRadius: '50%', 
                              bgcolor: COLORS[index % COLORS.length] 
                            }} 
                          />
                          <Typography variant="caption" color="text.secondary">
                            {item.name}: {item.value}%
                          </Typography>
                        </Stack>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Home;