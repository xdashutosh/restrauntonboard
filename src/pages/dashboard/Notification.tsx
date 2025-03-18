import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

// Example notification data structure
interface NotificationItem {
  id: number;
  primaryText: string;    // e.g. "Order ID: #123456789" or "The order has been cancelled."
  secondaryText?: string; // e.g. "You have received a new order." or "#123456789"
  ctaText?: string;       // e.g. "View" (optional)
  bgColor: string;        // background color for the notification card
}

// Sample notifications to replicate your screenshot
const notifications: NotificationItem[] = [
  {
    id: 1,
    primaryText: 'Order ID: #123456789',
    secondaryText: 'You have received a new order.',
    ctaText: 'View',
    bgColor: '#FFE8D2',
  },
  {
    id: 2,
    primaryText: 'The order has been cancelled.',
    secondaryText: '#123456789',
    bgColor: '#F2F2F2',
  },
  {
    id: 3,
    primaryText: 'Order ID: #123456789',
    secondaryText: 'You have received a new order.',
    ctaText: 'View',
    bgColor: '#FFE8D2',
  },
  {
    id: 4,
    primaryText: 'Your KYC has been approved',
    bgColor: '#E5F5E5',
  },
  {
    id: 5,
    primaryText: 'Order ID: #123456789',
    secondaryText: 'You have received a new order.',
    ctaText: 'View',
    bgColor: '#FFE8D2',
  },
  {
    id: 6,
    primaryText: 'Order ID: #123456789',
    secondaryText: 'You have received a new order.',
    ctaText: 'View',
    bgColor: '#FFE8D2',
  },
];

const Notification: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClearAll = () => {
    alert('Clear all notifications clicked');
  };

  const handleCTA = (item: NotificationItem) => {
    alert(`CTA clicked for notification ID: ${item.id}`);
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: 'auto',
        p: { xs: 2, sm: 3 },
      }}
    >
      {/* Header: bell icon + "Notifications" + "Clear all" link */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <NotificationsNoneIcon
            sx={{ mr: 1, color: '#ff9800' /* adjust color as needed */ }}
          />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: '#ff9800',
            fontWeight: 600,
            cursor: 'pointer',
            textTransform: 'none',
          }}
          onClick={handleClearAll}
        >
          Clear all
        </Typography>
      </Box>

      {/* Notification list */}
      <Stack spacing={2}>
        {notifications.map((item) => (
          <Card
            key={item.id}
            sx={{
              backgroundColor: item.bgColor,
              borderRadius: 2,
              boxShadow: 0,
            }}
          >
            <CardContent
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
              }}
            >
              {/* Primary/Secondary text */}
              <Box sx={{ mb: { xs: 1, sm: 0 } }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 'bold', mb: item.secondaryText ? 0.5 : 0 }}
                >
                  {item.primaryText}
                </Typography>
                {item.secondaryText && (
                  <Typography variant="body2">{item.secondaryText}</Typography>
                )}
              </Box>

              {/* CTA text (e.g. "View") on the right */}
              {item.ctaText && (
                <Typography
                  variant="body2"
                  sx={{
                    color: '#ff9800',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'none',
                  }}
                  onClick={() => handleCTA(item)}
                >
                  {item.ctaText}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default Notification;
