let ioInstance = null;

const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[Socket] New client connected: ${socket.id}`);

    // Join private room: user_<userId>
    socket.on('join_user_room', (userId) => {
      if (userId) {
        const roomName = `user_${userId}`;
        socket.join(roomName);
        console.log(`[Socket] Socket ${socket.id} joined private room: ${roomName}`);
      }
    });

    // Join admin room if user is admin
    socket.on('join_admin_room', () => {
      socket.join('admin_room');
      console.log(`[Socket] Socket ${socket.id} joined admin_room`);
    });

    // Leave user room
    socket.on('leave_user_room', (userId) => {
      if (userId) {
        socket.leave(`user_${userId}`);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Client disconnected: ${socket.id} (reason: ${reason})`);
    });
  });

  return io;
};

const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.IO is not initialized yet!');
  }
  return ioInstance;
};

module.exports = { initSocket, getIO };
