import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  phoneNumber: string | null;
  otp: string | null;
  otpExpiry: number | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  phoneNumber: null,
  otp: null,
  otpExpiry: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setPhoneNumber: (state, action: PayloadAction<string>) => {
      state.phoneNumber = action.payload;
    },
    generateOTP: (state) => {
      let myopt =Math.floor(1000 + Math.random() * 9000).toString();
      state.otp = myopt
      state.otpExpiry = Date.now() + 120000; // 2 minutes
      console.log(myopt)
    },

    verifyOTP: (state, action: PayloadAction<string>) => {
      if (state.otp == action.payload && Date.now() < (state.otpExpiry || 0)) {
        state.isAuthenticated = true;
        console.log("authenticated!");
      }
      else{
        console.log("not authenticated");
      }

    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.phoneNumber = null;
      state.otp = null;
      state.otpExpiry = null;
    },
  },
});

export const { setPhoneNumber, generateOTP, verifyOTP, logout } = authSlice.actions;
export default authSlice.reducer;
