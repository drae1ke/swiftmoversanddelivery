import React from "react"
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import Login from "./components/common/Login"
import Signup from "./components/common/SignUp"
import ForgotPassword from "./components/common/ForgotPassword"
import ResetPassword from "./components/common/ResetPassword"
import ProtectedRoute from "./components/common/ProtectedRoute"

import Home from "./pages/Home"
import Client from "./pages/client/MainClient"

/* 
// Admin Dashboard (modular)
import AdminLayout from "./pages/admin/AdminLayout"
import OverviewPage from "./pages/admin/OverviewPage"
import UsersPage from "./pages/admin/UsersPage"
import DriversPage from "./pages/admin/DriversPage"
import OrdersPage from "./pages/admin/OrdersPage"
import PropertiesPage from "./pages/admin/PropertiesPage"
import SettingsPage from "./pages/admin/SettingsPage" */

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
        {/*
        {/* Driver Dashboard - Protected for drivers only }
        <Route 
          path="/DriverDashboard" 
          element={
            <ProtectedRoute Component={DriverDashboard} allowedRoles={['driver']} />
          } 
        />
        
        {/* Landlord Dashboard - Protected for landlords only }
        <Route 
          path="/LandlordDashboard" 
          element={
            <ProtectedRoute Component={LandlordDashboard} allowedRoles={['landlord']} />
          } 
        />
        
        <Route path="/PropertyList" element={<PropertyList />} />

        {/* Admin Dashboard — nested routes - Protected for admins only }
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute Component={AdminLayout} allowedRoles={['admin']} />
          }
        >
          <Route index element={<OverviewPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="drivers" element={<DriversPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="properties" element={<PropertiesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Redirect old route }
        <Route path="/AdminDashboard" element={<Navigate to="/admin" replace />} />
       */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
