
import { Route, Routes, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { useLocation, Navigate as RouterNavigate } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";
import './index.css'
import RegistrationForm from "./components/RegistrationSteps";


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoutes />}>
        <Route path="/register" element={<RegistrationForm />} />
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
    </QueryClientProvider>
  );
}

export default App;
