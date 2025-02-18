
import { useState } from 'react';
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
  FormControlLabel
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Home,
  Assessment,
  ShoppingCart,
  RestaurantMenu,
  Feedback
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { toggleOnline } from '@/store/restaurantSlice';
import DashboardDrawer from '@/components/DashboardDrawer';
import HomePage from './home';
import ReportsPage from './reports';
import OrdersPage from './orders';
import MenuPage from './menu';
import FeedbackPage from './feedback';

const navItems = [
  { label: 'Home', icon: <Home />, path: '/dashboard' },
  { label: 'Reports', icon: <Assessment />, path: '/dashboard/reports' },
  { label: 'Orders', icon: <ShoppingCart />, path: '/dashboard/orders' },
  { label: 'Menu', icon: <RestaurantMenu />, path: '/dashboard/menu' },
  { label: 'Feedback', icon: <Feedback />, path: '/dashboard/feedback' },
];

export default function Dashboard() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isOnline } = useSelector((state: RootState) => state.restaurant);

  const currentPath = location.pathname;
  const currentTabIndex = navItems.findIndex(item => 
    currentPath === item.path || 
    (currentPath === '/dashboard' && item.path === '/dashboard')
  );

  return (
    <Box sx={{ pb: 7, minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static">
        <Toolbar>
          <FormControlLabel
            control={
              <MuiSwitch
                checked={isOnline}
                onChange={() => dispatch(toggleOnline())}
                color="default"
              />
            }
            label={isOnline ? "Online" : "Offline"}
            sx={{ mr: 'auto' }}
          />
          <IconButton
            color="inherit"
            edge="end"
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ mt: 2, px: 2 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
        </Routes>
      </Box>

      <Paper 
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} 
        elevation={3}
      >
        <BottomNavigation
          value={currentTabIndex}
          onChange={(_, newValue) => {
            navigate(navItems[newValue].path);
          }}
        >
          {navItems.map((item) => (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </BottomNavigation>
      </Paper>

      <DashboardDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </Box>
  );
}
