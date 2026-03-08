const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export function getAuthToken() {
  return sessionStorage.getItem('token');
}

export function setAuthToken(token) {
  if (token) {
    sessionStorage.setItem('token', token);
  } else {
    sessionStorage.removeItem('token');
  }
}

export function setCurrentUser(user) {
  if (user) {
    sessionStorage.setItem('user', JSON.stringify(user));
  } else {
    sessionStorage.removeItem('user');
  }
}

export function getCurrentUser() {
  try {
    const raw = sessionStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getUserRole() {
  const user = getCurrentUser();
  return user?.role || null;
}

export async function apiRequest(path, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message = data && data.message ? data.message : 'Request failed';
    throw new Error(message);
  }

  return data;
}

// ============= AUTHENTICATION API =============
export async function signup(userData) {
  return apiRequest('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function login(credentials) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function getMe() {
  return apiRequest('/api/auth/me');
}

export async function updateMe(profileData) {
  return apiRequest('/api/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(profileData),
  });
}

export async function forgotPassword(email) {
  return apiRequest('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resendReset(email) {
  return apiRequest('/api/auth/resend-reset', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token, newPassword) {
  return apiRequest('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function logout() {
  return apiRequest('/api/auth/logout', { method: 'POST' });
}

// ============= ORDER API =============
export async function createOrder(orderData) {
  return apiRequest('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
}

export async function getMyOrders(page = 1, limit = 20) {
  return apiRequest(`/api/orders/my?page=${page}&limit=${limit}`);
}

export async function getOrderById(orderId) {
  return apiRequest(`/api/orders/${orderId}`);
}

export async function trackOrder(orderId) {
  return apiRequest(`/api/orders/track/${orderId}`);
}

export async function estimatePrice(estimateData) {
  return apiRequest('/api/orders/estimate', {
    method: 'POST',
    body: JSON.stringify(estimateData),
  });
}

export async function getPricingBands() {
  return apiRequest('/api/orders/pricing/weight-bands');
}

export async function updateOrderStatus(orderId, status) {
  return apiRequest(`/api/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// ============= PROPERTY/STORAGE API =============
export async function listProperties(filters = {}) {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiRequest(`/api/properties${query}`);
}

export async function getPropertyById(propertyId) {
  return apiRequest(`/api/properties/${propertyId}`);
}

export async function getMyProperties() {
  return apiRequest('/api/properties/my/properties');
}

export async function createProperty(propertyData) {
  return apiRequest('/api/properties', {
    method: 'POST',
    body: JSON.stringify(propertyData),
  });
}

export async function updateProperty(propertyId, propertyData) {
  return apiRequest(`/api/properties/${propertyId}`, {
    method: 'PUT',
    body: JSON.stringify(propertyData),
  });
}

export async function deleteProperty(propertyId) {
  return apiRequest(`/api/properties/${propertyId}`, {
    method: 'DELETE',
  });
}

export async function bookProperty(propertyId, bookingData) {
  return apiRequest(`/api/properties/${propertyId}/book`, {
    method: 'POST',
    body: JSON.stringify(bookingData),
  });
}

export async function updatePropertyStatus(propertyId, status) {
  return apiRequest(`/api/properties/${propertyId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

// ============= DRIVER API =============
export async function getDriverDashboard() {
  return apiRequest('/api/driver/dashboard');
}

export async function getDriverProfile() {
  return apiRequest('/api/auth/me');
}

export async function updateDriverProfile(profileData) {
  return apiRequest('/api/driver/profile', {
    method: 'PATCH',
    body: JSON.stringify(profileData),
  });
}

export async function updateDriverStatus(status) {
  return apiRequest('/api/driver/status', {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function updateDriverLocation(coordinates) {
  return apiRequest('/api/driver/location', {
    method: 'PATCH',
    body: JSON.stringify({ coordinates }),
  });
}

export async function getNearbyOrders() {
  return apiRequest('/api/driver/nearby-orders');
}

export async function getNearbyRelocations() {
  return apiRequest('/api/driver/nearby-relocations');
}

export async function updateOrderStatusDriver(orderId, status) {
  return apiRequest(`/api/driver/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function acceptOrderDriver(orderId) {
  return apiRequest(`/api/driver/orders/${orderId}/accept`, {
    method: 'PATCH',
  });
}

export async function acceptRelocationDriver(relocationId) {
  return apiRequest(`/api/driver/relocations/${relocationId}/accept`, {
    method: 'PATCH',
  });
}

export async function getDriverMyOrders() {
  return apiRequest('/api/driver/my-orders');
}

export async function getDriverMyRelocations() {
  return apiRequest('/api/driver/my-relocations');
}

export async function setDriverOnlineStatus(isOnline) {
  return apiRequest('/api/driver/status', {
    method: 'PATCH',
    body: JSON.stringify({ isOnline }),
  });
}

// ============= CLIENT API =============
export async function getClientDashboard() {
  return apiRequest('/api/client/dashboard');
}

export async function getClientProfile() {
  return apiRequest('/api/auth/me');
}

export async function updateClientProfile(profileData) {
  return apiRequest('/api/client/profile', {
    method: 'PATCH',
    body: JSON.stringify(profileData),
  });
}

// ============= ADMIN API =============
export async function getAdminDashboard() {
  return apiRequest('/api/admin/dashboard');
}

export async function getAdminUsers(page = 1, limit = 20) {
  return apiRequest(`/api/admin/users?page=${page}&limit=${limit}`);
}

export async function getAdminUser(userId) {
  return apiRequest(`/api/admin/users/${userId}`);
}

export async function updateAdminUser(userId, userData) {
  return apiRequest(`/api/admin/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(userData),
  });
}

export async function deleteAdminUser(userId) {
  return apiRequest(`/api/admin/users/${userId}`, {
    method: 'DELETE',
  });
}

export async function getAdminDrivers(page = 1, limit = 20) {
  return apiRequest(`/api/admin/drivers?page=${page}&limit=${limit}`);
}

export async function updateAdminDriver(driverId, driverData) {
  return apiRequest(`/api/admin/drivers/${driverId}`, {
    method: 'PATCH',
    body: JSON.stringify(driverData),
  });
}

export async function getAdminOrders(page = 1, limit = 20, filters = {}) {
  const params = new URLSearchParams({ page, limit });
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });
  return apiRequest(`/api/admin/orders?${params.toString()}`);
}

export async function getAdminOrderById(orderId) {
  return apiRequest(`/api/admin/orders/${orderId}`);
}

export async function assignOrder(orderId, driverId) {
  return apiRequest(`/api/admin/orders/${orderId}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ driverId }),
  });
}

export async function updateAdminOrderStatus(orderId, status) {
  return apiRequest(`/api/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function getAdminProperties(page = 1, limit = 20) {
  return apiRequest(`/api/admin/properties?page=${page}&limit=${limit}`);
}

export async function updatePropertyStatusAdmin(propertyId, status) {
  return apiRequest(`/api/admin/properties/${propertyId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function getAdminLandlords(page = 1, limit = 20) {
  return apiRequest(`/api/admin/landlords?page=${page}&limit=${limit}`);
}

export async function getAdminRelocations(page = 1, limit = 20) {
  return apiRequest(`/api/admin/relocations?page=${page}&limit=${limit}`);
}

export async function getAdminAnalytics() {
  return apiRequest('/api/admin/analytics');
}

export async function getAdminDriverLocations() {
  return apiRequest('/api/admin/drivers/locations');
}

export async function getAdminPricingConfig() {
  return apiRequest('/api/admin/pricing/weight-bands');
}

export async function updateAdminPricingConfig(config) {
  return apiRequest('/api/admin/pricing/weight-bands', {
    method: 'PUT',
    body: JSON.stringify(config),
  });
}

// ============= RELOCATION API =============
export async function createRelocationRequest(relocationData) {
  return apiRequest('/api/relocations', {
    method: 'POST',
    body: JSON.stringify(relocationData),
  });
}

export async function getMyRelocations(page = 1, limit = 20) {
  return apiRequest(`/api/relocations/my?page=${page}&limit=${limit}`);
}

export async function getRelocationById(relocationId) {
  return apiRequest(`/api/relocations/${relocationId}`);
}

export async function updateRelocationStatus(relocationId, status) {
  return apiRequest(`/api/relocations/${relocationId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// ============= RATING API =============
export async function createRating(ratingData) {
  return apiRequest('/api/ratings', {
    method: 'POST',
    body: JSON.stringify(ratingData),
  });
}

export async function getDriverRatings(driverId, page = 1, limit = 10) {
  return apiRequest(`/api/ratings/driver/${driverId}?page=${page}&limit=${limit}`);
}

export async function canRateOrder(orderId) {
  return apiRequest(`/api/ratings/order/${orderId}/can-rate`);
}

// ============= NOTIFICATION API =============
export async function getNotifications(limit = 20, unreadOnly = false) {
  return apiRequest(`/api/notifications?limit=${limit}&unreadOnly=${unreadOnly}`);
}

export async function getUnreadCount() {
  return apiRequest('/api/notifications/unread-count');
}

export async function markNotificationAsRead(notificationId) {
  return apiRequest(`/api/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
}

export async function markAllNotificationsAsRead() {
  return apiRequest('/api/notifications/mark-all-read', {
    method: 'PATCH',
  });
}

// ============= UPLOAD API =============
export async function uploadImage(file) {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_BASE_URL}/api/upload/image`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  return data;
}

export async function uploadImages(files) {
  const token = getAuthToken();
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  const res = await fetch(`${API_BASE_URL}/api/upload/images`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  return data;
}
