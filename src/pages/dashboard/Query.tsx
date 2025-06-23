import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Stack,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Paper,
  Divider,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Tooltip,
  Badge,
  Grid,
  Drawer
} from '@mui/material';
import {
  Send as SendIcon,
  ArrowBack,
  Phone,
  Email,
  MoreVert,
  AttachFile,
  EmojiEmotions,
  Image as ImageIcon,
  CheckCircle,
  Schedule,
  Person,
  ShoppingCart,
  LocalOffer,
  Assignment,
  Star,
  Flag,
  Archive,
  Block,
  Replay,
  GetApp,
  Print,
  Close,
  Info
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

// Enhanced message data structure
interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'agent';
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'image' | 'file';
  attachments?: string[];
}

// Customer information structure
interface CustomerInfo {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  totalOrders: number;
  totalSpent: number;
  rating: number;
  joinDate: string;
  lastOrderDate: string;
  status: 'active' | 'vip' | 'new';
}

// Order information structure
interface OrderInfo {
  orderId: string;
  date: string;
  total: number;
  items: string[];
  status: 'delivered' | 'pending' | 'cancelled';
  paymentMethod: string;
}

// Enhanced sample data
const customerInfo: CustomerInfo = {
  id: 'CUST001',
  name: 'Shashank Tiwari',
  phone: '+919045153128',
  email: 'shashank.tiwari@email.com',
  avatar: 'https://via.placeholder.com/64x64?text=ST',
  totalOrders: 47,
  totalSpent: 12450,
  rating: 4.2,
  joinDate: '2023-03-15',
  lastOrderDate: '2024-01-15',
  status: 'vip'
};

const orderInfo: OrderInfo = {
  orderId: '#12121342',
  date: '2024-01-15T14:30:00Z',
  total: 485,
  items: ['Dal Makhani', 'Tandoori Roti (4pcs)', 'Paneer Butter Masala'],
  status: 'delivered',
  paymentMethod: 'UPI'
};

// Enhanced messages with timestamps and status
const initialMessages: ChatMessage[] = [
  {
    id: 1,
    text: 'I have problem with the taste.',
    sender: 'user',
    timestamp: '2024-01-15T15:30:00Z',
    status: 'read',
    type: 'text'
  },
  {
    id: 2,
    text: `Hello ${customerInfo.name}, I'm sorry to hear that you didn't like the food. I apologise!\n\nCould you please let me know more details about the issue?`,
    sender: 'agent',
    timestamp: '2024-01-15T15:31:00Z',
    status: 'read',
    type: 'text'
  },
  {
    id: 3,
    text: 'The food had too much salt that I wasn\'t able to take the next bite. The dal was extremely salty.',
    sender: 'user',
    timestamp: '2024-01-15T15:32:00Z',
    status: 'read',
    type: 'text'
  },
  {
    id: 4,
    text: `I understand your concern about the taste. This is definitely not the quality we strive for.\n\nI'll make sure that this feedback reaches our kitchen team immediately. Let me initiate your refund right away. You should receive it within 2-3 hours.`,
    sender: 'agent',
    timestamp: '2024-01-15T15:33:00Z',
    status: 'read',
    type: 'text'
  },
  {
    id: 5,
    text: 'Thank you so much for the quick resolution! Really appreciate the excellent customer service.',
    sender: 'user',
    timestamp: '2024-01-15T15:35:00Z',
    status: 'read',
    type: 'text'
  }
];

const Query: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { id } = useParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State management
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [quickRepliesOpen, setQuickRepliesOpen] = useState(false);

  // Quick reply templates
  const quickReplies = [
    "Thank you for reaching out. I'll help you resolve this issue.",
    "I apologize for the inconvenience. Let me look into this immediately.",
    "I've initiated your refund. You'll receive it within 2-3 hours.",
    "Could you please provide more details about the issue?",
    "Thank you for your patience. The issue has been resolved.",
    "I've escalated this to our team. We'll get back to you soon."
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending new message
  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: ChatMessage = {
      id: messages.length + 1,
      text: inputValue.trim(),
      sender: 'agent',
      timestamp: new Date().toISOString(),
      status: 'sent',
      type: 'text'
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
  };

  // Handle quick reply
  const handleQuickReply = (reply: string) => {
    setInputValue(reply);
    setQuickRepliesOpen(false);
  };

  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get customer status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vip': return '#gold';
      case 'active': return '#4caf50';
      case 'new': return '#2196f3';
      default: return '#757575';
    }
  };

  const MessageBubble = ({ message }: { message: ChatMessage }) => {
    const isUser = message.sender === 'user';
    
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: isUser ? 'flex-start' : 'flex-end',
          mb: 1
        }}
      >
        <Box
          sx={{
            maxWidth: '75%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: isUser ? 'flex-start' : 'flex-end'
          }}
        >
          <Paper
            elevation={1}
            sx={{
              backgroundColor: isUser ? '#f5f5f5' : '#E87C4E',
              color: isUser ? 'text.primary' : 'white',
              borderRadius: isUser
                ? '16px 16px 16px 4px'
                : '16px 16px 4px 16px',
              p: 1.5,
              mb: 0.5,
              whiteSpace: 'pre-line',
              wordBreak: 'break-word'
            }}
          >
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
              {message.text}
            </Typography>
          </Paper>
          
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography variant="caption" color="text.secondary">
              {formatTime(message.timestamp)}
            </Typography>
            {!isUser && message.status && (
              <CheckCircle 
                sx={{ 
                  fontSize: 12, 
                  color: message.status === 'read' ? '#4caf50' : '#757575' 
                }} 
              />
            )}
          </Stack>
        </Box>
      </Box>
    );
  };

  const CustomerInfoPanel = () => (
    <Box
      sx={{
        p: 2,
        height: '100%',
        overflowY: 'auto'
      }}
    >
      {/* Customer Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Avatar
          src={customerInfo.avatar}
          sx={{ width: 48, height: 48 }}
        >
          {customerInfo.name.charAt(0)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
              {customerInfo.name}
            </Typography>
            <Chip
              label={customerInfo.status.toUpperCase()}
              size="small"
              sx={{
                bgcolor: getStatusColor(customerInfo.status),
                color: 'white',
                fontWeight: 600,
                fontSize: '0.7rem'
              }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary" noWrap>
            Customer since {formatDate(customerInfo.joinDate)}
          </Typography>
        </Box>
      </Stack>

      {/* Contact Information */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Contact
        </Typography>
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Phone fontSize="small" color="action" />
            <Typography variant="body2" noWrap>{customerInfo.phone}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Email fontSize="small" color="action" />
            <Typography variant="body2" noWrap>{customerInfo.email}</Typography>
          </Stack>
        </Stack>
      </Box>

      {/* Customer Stats */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
          Summary
        </Typography>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Paper sx={{ p: 1, textAlign: 'center', bgcolor: '#f8f9fa' }}>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                {customerInfo.totalOrders}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Orders
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper sx={{ p: 1, textAlign: 'center', bgcolor: '#f8f9fa' }}>
              <Typography variant="h6" color="success.main" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                ₹{(customerInfo.totalSpent / 1000).toFixed(0)}k
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Spent
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Current Order Details */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
          Current Order
        </Typography>
        <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Order ID:
              </Typography>
              <Typography variant="body2">{orderInfo.orderId}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Total:
              </Typography>
              <Typography variant="body2" color="success.main">
                ₹{orderInfo.total}
              </Typography>
            </Stack>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Items:
              </Typography>
              {orderInfo.items.slice(0, 2).map((item, index) => (
                <Typography key={index} variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  • {item}
                </Typography>
              ))}
              {orderInfo.items.length > 2 && (
                <Typography variant="caption" color="text.secondary">
                  +{orderInfo.items.length - 2} more items
                </Typography>
              )}
            </Box>
          </Stack>
        </Paper>
      </Box>

      {/* Quick Actions */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Quick Actions
        </Typography>
        <Stack spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Replay />}
            fullWidth
          >
            Initiate Refund
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<LocalOffer />}
            fullWidth
          >
            Apply Discount
          </Button>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box 
      sx={{ 
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Chat Header */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexShrink: 0
        }}
      >
        <IconButton
          onClick={() => navigate('/dashboard/queries')}
          size="small"
        >
          <ArrowBack />
        </IconButton>
        
        <Avatar src={customerInfo.avatar} sx={{ width: 32, height: 32 }}>
          {customerInfo.name.charAt(0)}
        </Avatar>
        
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
            {customerInfo.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {orderInfo.orderId} • ₹{orderInfo.total}
          </Typography>
        </Box>

        <IconButton
          onClick={() => setDrawerOpen(true)}
          size="small"
        >
          <Info />
        </IconButton>

        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          size="small"
        >
          <MoreVert />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => setAnchorEl(null)}>
            <Flag sx={{ mr: 1 }} /> Flag
          </MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}>
            <Archive sx={{ mr: 1 }} /> Archive
          </MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}>
            <GetApp sx={{ mr: 1 }} /> Export
          </MenuItem>
        </Menu>
      </Paper>

      {/* Main Content Area */}
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Chat Messages Area */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          minWidth: 0
        }}>
          {/* Messages Container */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isTyping && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                <Paper
                  sx={{
                    backgroundColor: '#f5f5f5',
                    borderRadius: '16px 16px 16px 4px',
                    p: 1.5,
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Customer is typing...
                  </Typography>
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Quick Replies */}
          {quickRepliesOpen && (
            <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Quick Replies
              </Typography>
              <Stack spacing={1}>
                {quickReplies.slice(0, 3).map((reply, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    size="small"
                    onClick={() => handleQuickReply(reply)}
                    sx={{ 
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      textTransform: 'none'
                    }}
                  >
                    {reply}
                  </Button>
                ))}
              </Stack>
            </Box>
          )}

          {/* Input Area */}
          <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', flexShrink: 0 }}>
            <Stack direction="row" spacing={1} alignItems="flex-end">
              <TextField
                variant="outlined"
                placeholder="Type your message..."
                fullWidth
                multiline
                maxRows={3}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Quick Replies">
                          <IconButton
                            size="small"
                            onClick={() => setQuickRepliesOpen(!quickRepliesOpen)}
                            color={quickRepliesOpen ? 'primary' : 'default'}
                          >
                            <Assignment fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Attach">
                          <IconButton size="small">
                            <AttachFile fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSend}
                disabled={!inputValue.trim()}
                sx={{
                  minWidth: 48,
                  height: 40,
                  borderRadius: 2,
                  backgroundColor: '#E87C4E',
                  '&:hover': {
                    backgroundColor: '#D26E2F',
                  },
                }}
              >
                <SendIcon fontSize="small" />
              </Button>
            </Stack>
          </Box>
        </Box>

        {/* Desktop Sidebar */}
        {!isMobile && (
          <Paper
            sx={{
              width: 320,
              borderLeft: '1px solid #e0e0e0',
              display: { xs: 'none', md: 'block' }
            }}
          >
            <CustomerInfoPanel />
          </Paper>
        )}
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100vw', sm: 320 },
            maxWidth: '100vw'
          },
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 2, 
          borderBottom: '1px solid #e0e0e0' 
        }}>
          <Typography variant="h6" sx={{ flex: 1 }}>
            Customer Info
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <Close />
          </IconButton>
        </Box>
        <CustomerInfoPanel />
      </Drawer>
    </Box>
  );
};

export default Query;