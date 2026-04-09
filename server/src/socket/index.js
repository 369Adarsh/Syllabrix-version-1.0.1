// ============================================================
// Syllabrix Socket.io Manager
// Real-time: messaging, notifications, live class chat
// ============================================================

const { Server } = require('socket.io');
const { socketOptions } = require('../config/socket');
const { verifyToken } = require('../utils/token-utils');
const { socialPool } = require('../database/connection');

let io = null;

const initializeSocket = (httpServer) => {
  io = new Server(httpServer, socketOptions);

  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return next(new Error('Invalid token'));
      }

      // Attach user info to socket
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`  Socket connected: User ${socket.userId}`);

    // Join user's personal room (for notifications)
    socket.join(`user:${socket.userId}`);

    // If user is an admin, join the admin broadcast room for urgent alerts
    try {
      const [rows] = await socialPool.query(
        'SELECT admin_role FROM users WHERE id = ? AND admin_role IS NOT NULL AND is_active = 1 LIMIT 1',
        [socket.userId]
      );
      if (rows.length > 0) {
        socket.join('room:admins');
      }
    } catch (e) {
      // Non-blocking — don't kill the connection if this check fails
    }

    // ======================== MESSAGING ========================
    socket.on('join:conversation', (data) => {
      const roomId = [socket.userId, data.userId].sort().join(':');
      socket.join(`dm:${roomId}`);
    });

    socket.on('leave:conversation', (data) => {
      const roomId = [socket.userId, data.userId].sort().join(':');
      socket.leave(`dm:${roomId}`);
    });

    // ======================== GROUPS ========================
    socket.on('join:group', (data) => {
      socket.join(`group:${data.groupId}`);
    });

    socket.on('leave:group', (data) => {
      socket.leave(`group:${data.groupId}`);
    });

    // ======================== TYPING ========================
    socket.on('typing:start', (data) => {
      if (data.groupId) {
        socket.to(`group:${data.groupId}`).emit('typing:start', {
          userId: socket.userId,
          groupId: data.groupId,
        });
      } else if (data.userId) {
        const roomId = [socket.userId, data.userId].sort().join(':');
        socket.to(`dm:${roomId}`).emit('typing:start', {
          userId: socket.userId,
        });
      }
    });

    socket.on('typing:stop', (data) => {
      if (data.groupId) {
        socket.to(`group:${data.groupId}`).emit('typing:stop', {
          userId: socket.userId,
        });
      } else if (data.userId) {
        const roomId = [socket.userId, data.userId].sort().join(':');
        socket.to(`dm:${roomId}`).emit('typing:stop', {
          userId: socket.userId,
        });
      }
    });

    // ======================== DISCONNECT ========================
    socket.on('disconnect', () => {
      console.log(`  Socket disconnected: User ${socket.userId}`);
    });
  });

  return io;
};

// Get io instance (for emitting from services)
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Helper: send notification to a specific user
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

// Helper: send message to a DM conversation
const emitToDM = (userId1, userId2, event, data) => {
  if (io) {
    const roomId = [userId1, userId2].sort().join(':');
    io.to(`dm:${roomId}`).emit(event, data);
  }
};

// Helper: send message to a group
const emitToGroup = (groupId, event, data) => {
  if (io) {
    io.to(`group:${groupId}`).emit(event, data);
  }
};

// Helper: broadcast to all connected admin users
const emitToAdmins = (event, data) => {
  if (io) {
    io.to('room:admins').emit(event, data);
  }
};

module.exports = { initializeSocket, getIO, emitToUser, emitToDM, emitToGroup, emitToAdmins };
