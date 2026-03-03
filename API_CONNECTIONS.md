# API Connections Documentation

## Overview
This document outlines all the connections established between the frontend and backend to use real data instead of mock data.

## API Base Configuration
- **Base URL**: Configured via `VITE_API_BASE_URL` environment variable
- **Default**: `http://localhost:5000`
- **Location**: [src/api.js](src/api.js)

## Implemented Connections

### ✅ Authentication API
- `signup()` - Register new users
- `login()` - User authentication
- `getMe()` - Get current user profile
- `updateMe()` - Update current user profile
- `forgotPassword()` - Password reset initiation
- `resetPassword()` - Password reset completion

**Connected Components:**
- Login page
- Signup page
- All authenticated components

### ✅ Order Management API
- `createOrder()` - Create new orders
- `getMyOrders()` - Fetch user's orders
- `trackOrder()` - Track specific orders by ID
- `estimatePrice()` - Get price estimates
- `getPricingBands()` - Get pricing tiers
- `updateOrderStatus()` - Update order status

**Connected Components:**
- [Client Tracking Page](src/pages/client/Tracking%20.jsx)
- [Client Profile](src/pages/client/Profile.jsx)

### ✅ Property/Storage Management API
- `listProperties()` - List available properties with filters
- `getPropertyById()` - Get property details
- `bookProperty()` - Create property booking
- `getMyProperties()` - Get landlord's properties
- `createProperty()` - Create new property
- `updateProperty()` - Update property details
- `deleteProperty()` - Delete property

**Connected Components:**
- [Storage Browse Page](src/pages/client/Storage.jsx) - Lists real properties instead of mock data
- [Storage Booking Page](src/pages/client/StorageBook.jsx) - Books real properties with API

### ✅ Driver Dashboard API
- `getDriverDashboard()` - Get driver overview and nearby orders
- `getDriverProfile()` - Get driver profile information
- `updateDriverProfile()` - Update driver profile
- `updateDriverStatus()` - Change driver availability status
- `updateDriverLocation()` - Update driver GPS location
- `getNearbyOrders()` - Get orders near driver location
- `getNearbyRelocations()` - Get relocations near driver location

**Connected Components:**
- [Driver Layout](src/pages/driver/DriverLayout.jsx) - Fetches real driver data and trips

### ✅ Admin Dashboard API
- `getAdminDashboard()` - Get admin overview statistics
- `getAdminUsers()` - List all system users
- `getAdminOrders()` - List all orders/trips
- `getAdminProperties()` - List all properties
- `getAdminDrivers()` - Manage drivers
- `getAdminLandlords()` - List landlords
- `getAdminRelocations()` - List relocations
- `getAdminAnalytics()` - Get system analytics
- `getAdminPricingConfig()` - View pricing configuration
- `updateAdminPricingConfig()` - Update pricing

**Connected Components:**
- [Admin Layout](src/pages/admin/AdminLayout.jsx) - Fetches real admin data

### ✅ Notification API
- `getNotifications()` - Fetch notifications
- `getUnreadCount()` - Count unread notifications
- `markNotificationAsRead()` - Mark notification as read
- `markAllNotificationsAsRead()` - Mark all as read

**Connected Components:**
- Notification dropdown components

### ✅ Rating API
- `createRating()` - Create delivery/service rating
- `getDriverRatings()` - Get driver's ratings
- `canRateOrder()` - Check if order can be rated

**Connected Components:**
- Rating modal components

### ✅ Relocation API (Partial)
- `createRelocationRequest()` - Create relocation request
- `getMyRelocations()` - Get user's relocations
- `getRelocationById()` - Get relocation details
- `updateRelocationStatus()` - Update status

## Data Transformation Patterns

### Storage/Property Transformation
Properties from backend are transformed to match UI format:
```javascript
{
  id: property._id,
  name: property.name,
  location: property.location,
  icon: '📦',
  status: property.availability === 'available' ? 'available' : 'limited',
  tags: ['size', 'features'],
  price: `KES ${property.pricePerMonth}`
}
```

### Order/Trip Transformation
Orders are transformed into trips/tracking format:
```javascript
{
  type: data.serviceType,
  status: data.status,
  statusClass: 'transit' | 'delivered' | 'pending',
  pkg: [{ l: label, v: value }],
  driver: { initials, name, rating },
  timeline: [{ state, title, desc, time }]
}
```

## Environment Setup

### Required Environment Variables
```env
VITE_API_BASE_URL=http://localhost:5000
```

### Backend Requirements
- Node.js backend running on port 5000
- Database connected and migrated
- All routes configured as per [routes documentation](backend/src/routes/)

## Testing the Connections

### 1. Verify Backend is Running
```bash
curl http://localhost:5000/api/health
```

### 2. Test Authentication
1. Sign up at `/signup`
2. Login at `/login`
3. Token should be stored in localStorage

### 3. Test Storage Booking
1. Navigate to Storage page
2. Should list real properties from API
3. Click "Book Now" and complete booking

### 4. Test Order Tracking
1. Create an order or have existing orders
2. Go to Tracking page
3. Enter order ID to see real tracking data

### 5. Test Driver Dashboard
1. Login as driver
2. Should see real nearby orders and dashboard data

### 6. Test Admin Dashboard
1. Login as admin
2. Should see real users, properties, and orders

## Known Limitations & TODO

- [ ] Relocation endpoints not fully integrated (mock data in use)
- [ ] Document management not connected (driver docs)
- [ ] Schedule data is generated from orders
- [ ] Alerts are static (can be enhanced with backend)
- [ ] Real-time location updates (WebSocket integration needed)
- [ ] Chat/messaging system not connected
- [ ] Payment integration not configured

## File Locations

| File | Purpose |
|------|---------|
| [src/api.js](src/api.js) | Centralized API client with all endpoints |
| [src/pages/client/Storage.jsx](src/pages/client/Storage.jsx) | Storage listing using real API |
| [src/pages/client/StorageBook.jsx](src/pages/client/StorageBook.jsx) | Storage booking using real API |
| [src/pages/client/Tracking.jsx](src/pages/client/Tracking%20.jsx) | Order tracking using real API |
| [src/pages/client/Profile.jsx](src/pages/client/Profile.jsx) | Profile and order history using real API |
| [src/pages/driver/DriverLayout.jsx](src/pages/driver/DriverLayout.jsx) | Driver dashboard using real API |
| [src/pages/admin/AdminLayout.jsx](src/pages/admin/AdminLayout.jsx) | Admin dashboard using real API |

## Next Steps

1. Test all connections with actual backend
2. Implement error handling for network failures
3. Add loading states and skeleton screens
4. Implement pagination for large data sets
5. Add real-time updates via WebSocket
6. Implement caching for frequently accessed data
7. Add offline support
