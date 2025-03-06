
import { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Switch as MuiSwitch,
  FormControlLabel,
  Stack
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Home,
  RestaurantMenu,
  HomeOutlined,
  AssessmentOutlined,
  CompareArrowsOutlined,
  StarOutline
} from '@mui/icons-material';
// import DashboardDrawer from '@/components/DashboardDrawer';
import HomePage from './home';
import ReportsPage from './reports';
import OrdersPage from './orders';
import MenuPage from './menu';
import FeedbackPage from './feedback';
import Closer from '../Closer';
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import axiosInstance from '../../interceptor/axiosInstance';

const navItems = [
  { label: 'Home', icon: <HomeOutlined />, path: '/dashboard' },
  { label: 'Reports', icon: <AssessmentOutlined />, path: '/dashboard/reports' },
  { label: 'Orders', icon: <CompareArrowsOutlined />, path: '/dashboard/orders' },
  { label: 'Menu', icon: <RestaurantMenu />, path: '/dashboard/menu' },
  { label: 'Feedback', icon: <StarOutline />, path: '/dashboard/feedback' },
];

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const userData = useSelector((state: RootState) => state.auth.userData);
  const [restdata,setrestdata]=useState<any>([]);
  console.log(userData);

  useEffect(()=>{
    const getdata = async()=>{
      const res = await axiosInstance.get(`/restraunts/?vendor_id=${userData?.vendor_id}`);
      console.log(res?.data?.data?.rows[0]);
     setrestdata(res?.data?.data?.rows[0])
    }
    getdata();
    },[userData]);

  const currentPath = location.pathname;
  const currentTabIndex = navItems.findIndex(item => 
    currentPath === item.path || 
    (currentPath === '/dashboard' && item.path === '/dashboard')
  );

  return (
    <Box sx={{ pb: 7, minHeight: '100vh', bgcolor:'whitesmoke' }}>
    
   

      <Box sx={{ mt: 2,  }}>
        <Routes>
          <Route path="/" element={<HomePage restdata={restdata} />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/closer" element={<Closer />} />
        </Routes>
      </Box>

      <Paper 
  sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderRadius: '16px 16px 0 0', overflow: 'hidden' }} 
  elevation={3}
>
  <BottomNavigation
    value={currentTabIndex}
    onChange={(_, newValue) => {
      navigate(navItems[newValue].path);
    }}
    sx={{
      bgcolor: '#FFFFFF',
      height: '65px',
      display: 'flex',
      justifyContent: 'space-around',
    }}
  >
    {navItems.map((item, index) => (
      <BottomNavigationAction
        key={item.path}
        label={item.label}
        icon={item.icon}
        sx={{
          
          color: currentTabIndex === index ? '#E87C4E' : '#676767',
          fontSize: '12px',
          fontWeight: currentTabIndex === index ? 'bold' : 'normal',
          '& .MuiBottomNavigationAction-label': {
            transition: 'none',
            fontSize: currentTabIndex === index ? '10px' : '8px',
          },
          '& .MuiSvgIcon-root': {
            fontSize: item?.label=="Orders"?'45px':"30px",
            backgroundColor:item?.label=="Orders" ?'#EB8041':'',
            color:item?.label=="Orders"? 'white':'',
            borderRadius:item?.label=="Orders"? '50%':"0%",
              
          },
          '&.Mui-selected': {
            color: '#E87C4E',
          },
          '&:hover': {
            color: '#E87C4E',
          },
          position: 'relative',
          '&.Mui-selected::before': {
            content: '""',
            position: 'absolute',
            top: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '40px',
            height: '40px',
            backgroundColor: '#E87C4E',
            borderRadius: '50%',
            zIndex: -1,
          }
        }}
      />
    ))}
  </BottomNavigation>
</Paper>



    </Box>
  );
}
