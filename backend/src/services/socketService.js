const { Server } = require('socket.io');

let io = null;

// Map userId -> socketId for targeted events
const userSockets = new Map();

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Client registers with their userId and role
    socket.on('register', ({ userId, role }) => {
      if (!userId) return;
      userSockets.set(userId, socket.id);
      socket.userId = userId;
      socket.userRole = role;

      // Join role-based rooms
      if (role) {
        socket.join(`role:${role}`);
      }

      // Admins join admin room for location updates
      if (role === 'admin') {
        socket.join('admin');
      }

      // Drivers join driver room for new order alerts
      if (role === 'driver') {
        socket.join('drivers');
      }
    });

    // Driver sends location update
    socket.on('driver_location', (data) => {
      // Broadcast to admin room
      io.to('admin').emit('driver_location_update', {
        driverId: data.driverId,
        userId: socket.userId,
        coordinates: data.coordinates,
        fullName: data.fullName,
        vehicleType: data.vehicleType,
      });
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        userSockets.delete(socket.userId);
      }
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  return io;
}

// Notify all online drivers of a new order
function notifyDriversNewOrder(orderData) {
  if (!io) return;
  io.to('drivers').emit('new_order', orderData);
}

// Notify a specific client that their order was accepted
function notifyClientOrderAccepted(clientUserId, orderData) {
  if (!io) return;
  const socketId = userSockets.get(clientUserId);
  if (socketId) {
    io.to(socketId).emit('order_accepted', orderData);
  }
}

// Notify admins of a driver location update
function notifyAdminDriverLocation(driverData) {
  if (!io) return;
  io.to('admin').emit('driver_location_update', driverData);
}

module.exports = {
  initSocket,
  getIO,
  notifyDriversNewOrder,
  notifyClientOrderAccepted,
  notifyAdminDriverLocation,
};
