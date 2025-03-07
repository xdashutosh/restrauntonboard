import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, TextField, Button, Typography, Box, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../store/authSlice';
import type { RootState } from '../store/store';
import { useToast } from '../hooks/use-toast';
import React from 'react';
import axiosInstance from '../interceptor/axiosInstance';

export default function Login() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otpInput, setOtpInput] = useState(['', '', '', '']); // Four separate OTP inputs
  const [showOTP, setShowOTP] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [error,seterror]=useState("");
  const otpExpiry  =Date.now() + 120000;

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
  }, [showOTP]);

  const handleSendOTP = async() => {
    if (phone.length !== 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive"
      });
      return;
    }
const res = await axiosInstance.post("/send-otp",{"mobile":phone});
console.log(res?.data?.data?.otp);

   
    setShowOTP(true);
    setTimeLeft(120);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && !isNaN(Number(value))) {
      const newOtpInput = [...otpInput];
      newOtpInput[index] = value;
      setOtpInput(newOtpInput);
  
      // Move to next box automatically
      if (value && index < 3) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
  
      // Trigger verification when last box is filled
      if (index === 3 && value.length === 1) {
        handleVerifyOTP(newOtpInput.join(''));
      }
    }
  };
  
  // Handle backspace key navigation
  const handleKeyDown = (index: number, event: React.KeyboardEvent) => {
    if (event.key === 'Backspace') {
      if (!otpInput[index] && index > 0) {
        document.getElementById(`otp-${index - 1}`)?.focus();
      }
    } else if (event.ctrlKey && event.key === 'Backspace') {
      setOtpInput(['', '', '', '']); // Clear all fields
      document.getElementById(`otp-0`)?.focus(); // Focus on the first field
    }
  };
  
  const handleVerifyOTP = async(otp: string) => {
const res = await axiosInstance.post(`/verify-otp`,{"mobile":phone,otp});
console.log(res?.data?.status);

if(res?.data?.status)
{
  dispatch(setUser(res?.data?.data?.rows[0]));
  // toast({
  //   title: "Success",
  //   description: "OTP verified successfully"
  // });
  navigate('/register');
}
else{
  // toast({
  //   title: "Invalid OTP",
  //   description: "Please enter the correct OTP",
  //   variant: "destructive"
  // });
  seterror("Invalid Otp or expired!")
}
  
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'end', 
      justifyContent: 'center',
      background: `linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.3), transparent), 
      url(https://rishikeshcamps.in/wp-content/uploads/2023/05/restaarant.jpg)`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}>
      <Card sx={{ width: '100%', height: '50vh', borderTopLeftRadius: '40px', borderTopRightRadius: '40px' }}>
        <CardContent sx={{ p: 2 }}>
          <Stack>
            <Typography fontFamily={"font-katibeh"} fontSize={40} gutterBottom>
              Partner with <b style={{ color: '#EB8041' }}>OLF</b>
            </Typography>
            <Typography marginTop={-2} fontFamily={"font-katibeh"} fontSize={40} gutterBottom>
              Store & Serve More!
            </Typography>
            <Typography fontFamily={"font-katibeh"} letterSpacing={0.5} color='gray'>
              Login to manage orders, update menus, and serve passengers with ease.
            </Typography>
          </Stack>

          {!showOTP ? (
            <>
              <TextField
                fullWidth
                label="mobile Number"
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
                sx={{ mt: 2, p: 1, fontSize: 'larger', borderRadius: 2, bgcolor: '#EB8041' }}
              >
                Login
              </Button>
            </>
          ) : (
            <>
              <Box sx={{ display: 'flex',justifyContent:'center',mt:4,gap:2 }}>
                {otpInput.map((digit, index) => (
                  <TextField
                  key={index}
                  id={`otp-${index}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  variant="outlined"
                  type="tel"
                  inputProps={{ maxLength: 1, style: { textAlign: 'center' } }}
                  sx={{ width: '4rem', borderRadius: '20px' }}
                />
                ))}
              </Box>
              <Typography sx={{textAlign:'center',color:'red'}}>{error}</Typography>
              {timeLeft != 0 &&
              <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 1 }}>
                Time remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </Typography>
              }

              {timeLeft == 0 && (
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
