import React from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
} from '@mui/material';

// Example transaction interface
interface Transaction {
  id: number;
  title: string;       // e.g. "Added to Wallet", "Sent to Rahul Rastogi", etc.
  date: string;        // e.g. "Jan 25th | 12:00 PM"
  amount: number;      // positive for add, negative for sent/refund
}

// Dummy data
const walletBalance = 4500;
const transactions: Transaction[] = [
  { id: 1, title: 'Added to Wallet', date: 'Jan 25th | 12:00 PM', amount: 500 },
  { id: 2, title: 'Sent to Rahul Rastogi', date: 'Jan 25th | 2:00 PM', amount: -450 },
  { id: 3, title: 'Added to Wallet', date: 'Jan 25th | 10:00 PM', amount: 750 },
  { id: 4, title: 'Refunded Back', date: 'Jan 25th | 2:00 PM', amount: 250 },
  { id: 5, title: 'Added to Wallet', date: 'Jan 25th | 10:00 PM', amount: 1400 },
];

const Wallet: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: 'auto',
        p: { xs: 2, sm: 3 },
      }}
    >
      {/* Top bar: Wallet title and "Add Money" button/link */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Wallet
        </Typography>
        <Button
          variant="text"
          sx={{
            // Adjust to match your design's color
            color: '#ff9800',
            fontWeight: 600,
            textTransform: 'none',
          }}
          onClick={() => alert('Add Money clicked')}
        >
          Add Money
        </Button>
      </Box>

      {/* Green Card for Wallet Balance */}
      <Box
        sx={{
          backgroundColor: '#4caf50', // Adjust green shade as needed
          borderRadius: 2,
          color: '#fff',
          textAlign: 'center',
          py: 3,
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          ₹{walletBalance.toLocaleString('en-IN')}
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          Wallet Balance
        </Typography>
      </Box>

      {/* Latest Transactions heading */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Latest Transactions
      </Typography>

      {/* Transaction list */}
      <Stack spacing={2}>
        {transactions.map((tx) => {
          const isPositive = tx.amount >= 0;
          const displayAmount = `${isPositive ? '+' : '-'} ₹${Math.abs(tx.amount)}`;
          const amountColor = isPositive ? '#4caf50' : '#f44336'; // green vs. red

          return (
            <Card
              key={tx.id}
              sx={{
                borderRadius: 2,
                backgroundColor: isMobile ? '#fff' : '#fff',
                boxShadow: 1,
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  flexDirection: { xs: 'column', sm: 'row' },
                }}
              >
                {/* Left side: title & date/time */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: { xs: 'flex-start', sm: 'flex-start' },
                    mb: { xs: 1, sm: 0 },
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {tx.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {tx.date}
                  </Typography>
                </Box>

                {/* Right side: amount */}
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: amountColor }}
                >
                  {displayAmount}
                </Typography>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
};

export default Wallet;
