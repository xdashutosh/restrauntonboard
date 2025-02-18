import { Box, Paper, Typography } from '@mui/material';
import RegistrationSteps from '@/components/RegistrationSteps';

export default function Register() {
  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'background.default',
      py: 3,
      px: 2
    }}>
      <Paper 
        elevation={3}
        sx={{ 
          maxWidth: 800, 
          mx: 'auto',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h5" component="h1">
            Restaurant Registration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete the following steps to register your restaurant
          </Typography>
        </Box>
        <RegistrationSteps />
      </Paper>
    </Box>
  );
}
