import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OutletState {
  outlet_id: any;
  
}

const initialState: OutletState = {
 outlet_id:null
};

const outletSlice = createSlice({
  name: 'outlet_id',
  initialState,
  reducers: {
    setOutletid: (state, action: PayloadAction<string>) => {
      state.outlet_id = action.payload;
    },

  },
});

export const { setOutletid } = outletSlice.actions;
export default outletSlice.reducer;
