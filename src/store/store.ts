import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import restaurantReducer from './restaurantSlice';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import { persistStore, persistReducer } from 'redux-persist';

// Configuration for redux-persist
const persistConfig = {
  key: 'root', // Key for the persisted store
  storage, // Storage method (default is localStorage)
  whitelist: ['auth', 'restaurant'], // List of slices you want to persist
};

// Combine the reducers
const rootReducer = combineReducers({
  auth: authReducer,
  restaurant: restaurantReducer,
});

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check for redux-persist
    }),
});

// Export types for usage throughout the app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Create the persistor
export const persistor = persistStore(store);
