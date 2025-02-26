import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Restaurant, Documents, WorkingDays } from '../../shared/schema';

interface RestaurantState {
  data: Restaurant | null;
  isOnline: boolean | null; // Changed from boolean | null to just boolean
}

const initialState: RestaurantState = {
  data: null,
  isOnline: true ,
};

const MOCK_RESTAURANT: Restaurant = {
  id: 1,
  userId: 1,
  name: "Sample Restaurant",
  ownerName: "John Doe",
  location: "Mumbai Central",
  minOrderAmount: 100,
  photos: [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
    "https://images.unsplash.com/photo-1497644083578-611b798c60f3",
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b",
    "https://images.unsplash.com/photo-1494346480775-936a9f0d0877",
  ],
  email: "john@example.com",
  mobileNumber: "9876543210",
  whatsappNumber: "9876543210",
  workingDays: {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: false,
  },
  openingTime: "10:00",
  closingTime: "22:00",
  documents: {
    gst: "https://images.unsplash.com/photo-1581782834895-b2a5347d0db8",
    fssai: "https://images.unsplash.com/photo-1613244470042-e69e8ccb303a",
    idProof: "https://images.unsplash.com/photo-1562564055-71e051d33c19",
    addressProof: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3",
  },
  isOnline: true, // Never null
  createdAt: new Date(),
};

const restaurantSlice = createSlice({
  name: 'restaurant',
  initialState,
  reducers: {
    setRestaurant: (state, action: PayloadAction<Restaurant>) => {
      state.data = action.payload;
      state.isOnline = action?.payload?.isOnline;
    },
    toggleOnline: (state) => {
      state.isOnline = !state.isOnline;
      if (state.data) {
        state.data.isOnline = state.isOnline;
      }
    },
    loadMockData: (state) => {
      state.data = MOCK_RESTAURANT;
      state.isOnline = MOCK_RESTAURANT.isOnline;
    },
  },
});

export const { setRestaurant, toggleOnline, loadMockData } = restaurantSlice.actions;
export default restaurantSlice.reducer;