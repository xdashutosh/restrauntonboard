
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Person,
  AttachMoney,
  Report,
  Feedback,
  ShoppingCart,
  Watch,
  Money,
  Discount,
  CalendarViewWeekRounded,
  Group,
  Chat,
  Person4Rounded,
  Compare,
  CompareArrows,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { WatchIcon } from 'lucide-react';

interface DashboardDrawerProps {
  open: boolean;
  onClose: () => void;
}

const drawerItems = [
  { text: 'Vendor Profile', icon: <Person4Rounded />, path: '/dashboard/profile' },
  { text: 'Order History', icon: <CompareArrows />, path: '/dashboard/history' },
  { text: 'Payment History', icon: <Money/>, path: '/dashboard/money' },
  { text: 'Offers', icon: <Discount />, path: '/dashboard/revenue' },
  { text: 'Scheduled Closer', icon: <CalendarViewWeekRounded />, path: '/dashboard/closer' },
  { text: 'Delivery Boy', icon: <Group />, path: '/dashboard/delboy' },
  { text: 'Customer Interaction', icon: <Chat/>, path: '/dashboard/chat' },
];

export default function DashboardDrawer({ open, onClose }: DashboardDrawerProps) {
  const navigate = useNavigate();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
    >
      <List sx={{p:1,mt:4,display:'flex',flexDirection:'column',gap:2 }}>
        {drawerItems.map((item) => (
          <ListItem
            sx={{borderBottom:'1px solid #eee',py:1,gap:-1}}
            key={item.text}
            onClick={() => {
              navigate(item.path);
              onClose();
            }}
          >
            <ListItemIcon sx={{color:'#EB8041'}}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
        
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}
