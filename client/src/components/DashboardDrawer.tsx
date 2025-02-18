
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  Person,
  AttachMoney,
  Report,
  Feedback,
  ShoppingCart,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface DashboardDrawerProps {
  open: boolean;
  onClose: () => void;
}

const drawerItems = [
  { text: 'Profile', icon: <Person />, path: '/dashboard/profile' },
  { text: 'Revenue', icon: <AttachMoney />, path: '/dashboard/revenue' },
  { text: 'Complaints', icon: <Report />, path: '/dashboard/complaints' },
  { text: 'Feedback', icon: <Feedback />, path: '/dashboard/feedback' },
  { text: 'All Orders', icon: <ShoppingCart />, path: '/dashboard/orders' },
];

export default function DashboardDrawer({ open, onClose }: DashboardDrawerProps) {
  const navigate = useNavigate();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
    >
      <List sx={{ width: 250 }}>
        {drawerItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              onClose();
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}
