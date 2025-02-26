import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useLocation, Navigate as RouterNavigate } from "react-router-dom";



const ProtectedRoutes = () => {
   // const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
   let isAuthenticated = true
   console.log(isAuthenticated)
   // const isAuthenticated = true;
   const location = useLocation();
   
   if (!isAuthenticated) {
     return <RouterNavigate to="/login" state={{ from: location }} replace />;
   }
   else{
     return <><Outlet /> </>;

   }


};

export default ProtectedRoutes;
