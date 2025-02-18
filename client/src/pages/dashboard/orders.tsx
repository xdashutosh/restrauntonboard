import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Badge
} from '@mui/material';
import { Check, Clear } from '@mui/icons-material';
import { useState } from 'react';

interface Order {
  id: number;
  customerName: string;
  items: string[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  time: string;
}

const mockOrders: Order[] = [
  {
    id: 1,
    customerName: "Rahul Kumar",
    items: ["Butter Chicken", "Naan", "Dal Makhani"],
    total: 850,
    status: "pending",
    time: "10 mins ago"
  },
  {
    id: 2,
    customerName: "Priya Singh",
    items: ["Paneer Tikka", "Jeera Rice"],
    total: 450,
    status: "pending",
    time: "15 mins ago"
  },
  {
    id: 3,
    customerName: "Amit Shah",
    items: ["Biryani", "Raita"],
    total: 350,
    status: "completed",
    time: "30 mins ago"
  },
  {
    id: 4,
    customerName: "Neha Gupta",
    items: ["Masala Dosa", "Coffee"],
    total: 250,
    status: "cancelled",
    time: "45 mins ago"
  }
];

export default function Orders() {
  const [orders, setOrders] = useState(mockOrders);

  const handleStatusChange = (orderId: number, newStatus: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const pendingCount = orders.filter(order => order.status === 'pending').length;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Orders
        </Typography>
        <Badge 
          badgeContent={pendingCount} 
          color="warning"
          sx={{ ml: 2 }}
        >
          <Typography variant="body1">Pending</Typography>
        </Badge>
      </Box>

      <List>
        {orders.map((order) => (
          <Card key={order.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  {order.customerName}
                </Typography>
                <Chip 
                  label={order.status}
                  color={getStatusColor(order.status)}
                  size="small"
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {order.items.join(", ")}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography variant="body1">
                  ₹{order.total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {order.time}
                </Typography>
              </Box>

              {order.status === 'pending' && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <IconButton 
                    color="success"
                    onClick={() => handleStatusChange(order.id, 'completed')}
                  >
                    <Check />
                  </IconButton>
                  <IconButton 
                    color="error"
                    onClick={() => handleStatusChange(order.id, 'cancelled')}
                  >
                    <Clear />
                  </IconButton>
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </List>
    </Box>
  );
}
