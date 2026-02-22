import React from "react"
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import Login from "./components/common/Login"
import Signup from "./components/common/SignUp"
import ForgotPassword from "./components/common/ForgotPassword"
import ResetPassword from "./components/common/ResetPassword"
import ProtectedRoute from "./components/common/ProtectedRoute"

import Home from "./pages/Home"
import Client from "./pages/client/MainClient"
import LandlordDashboard from "./pages/landlord/LandlordLayout"
import AdminDashboard from "./pages/admin/AdminLayout"
import DriverDashboard from "./pages/driver/driverLayout"

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/ResetPassword" element={<ResetPassword />} />
        
        <Route 
          path="/Client" 
          element={
            <ProtectedRoute Component={Client} allowedRoles={['client']} />
          } 
        />
        <Route 
          path="/LandlordDashboard" 
          element={
            <ProtectedRoute Component={LandlordDashboard} allowedRoles={['landlord']} />
          } 
        />
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute Component={AdminDashboard} allowedRoles={['admin']} />
          } 
        />
        <Route 
          path="/DriverDashboard" 
          element={
            <ProtectedRoute Component={DriverDashboard} allowedRoles={['driver']} />
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
