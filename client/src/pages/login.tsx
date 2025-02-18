
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, TextField, Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { setPhoneNumber, generateOTP, verifyOTP } from '@/store/authSlice';
import type { RootState } from '@/store/store';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const { otp, otpExpiry } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (otpExpiry) {
      const timer = setInterval(() => {
        const remaining = Math.max(0, Math.floor((otpExpiry - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining === 0) {
          clearInterval(timer);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [otpExpiry]);

  const handleSendOTP = () => {
    if (phone.length !== 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive"
      });
      return;
    }
    dispatch(setPhoneNumber(phone));
    dispatch(generateOTP());
    setShowOTP(true);
    setTimeLeft(120);
  };

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const handleVerifyOTP = () => {
    dispatch(verifyOTP(otpInput));
    if (isAuthenticated) {
      toast({
        title: "Success",
        description: "OTP verified successfully"
      });
      navigate('/register');
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter the correct OTP",
        variant: "destructive"
      });
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      p: 2,
      bgcolor: 'background.default'
    }}>
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom align="center">
            Restaurant Login
          </Typography>
          
          {!showOTP ? (
            <>
              <TextField
                fullWidth
                label="Phone Number"
                variant="outlined"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                margin="normal"
                inputProps={{ maxLength: 10 }}
              />
              <Button 
                fullWidth 
                variant="contained" 
                onClick={handleSendOTP}
                sx={{ mt: 2 }}
              >
                Send OTP
              </Button>
            </>
          ) : (
            <>
              <TextField
                fullWidth
                label="Enter OTP"
                variant="outlined"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                type="number"
                margin="normal"
                inputProps={{ maxLength: 4 }}
              />
              <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 1 }}>
                Time remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </Typography>
              <Button 
                fullWidth 
                variant="contained" 
                onClick={handleVerifyOTP}
                disabled={timeLeft === 0}
                sx={{ mt: 2 }}
              >
                Verify OTP
              </Button>
              {timeLeft === 0 && (
                <Button
                  fullWidth
                  variant="text"
                  onClick={handleSendOTP}
                  sx={{ mt: 1 }}
                >
                  Resend OTP
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
