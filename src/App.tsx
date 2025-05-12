
import { Route, Routes, Navigate ,BrowserRouter} from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "../src/components/ui/toaster";
import Login from "../src/pages/login";
import Dashboard from "../src/pages/dashboard";
import NotFound from "../src/pages/not-found";
import ProtectedRoutes from "./ProtectedRoutes";
import './index.css'
import RegistrationForm from "./components/RegistrationSteps";
import React from "react";
import { Provider } from "react-redux";
import { persistor, store } from "./store/store";
import { PersistGate } from 'redux-persist/integration/react';
import Outlets from "./components/Outlets";


function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}></PersistGate>
  <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoutes />}>
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/outlets/:id" element={<Outlets />} />
        <Route 
          path="/dashboard/*" 
          element={
                <Dashboard />
          } 
          />
          </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
      </BrowserRouter>
      </Provider>
  );
}

export default App;
