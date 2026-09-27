require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { connectDB } = require('./config/db');
const { initSocket } = require('./sockets/socketHandler');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to Database (Atlas, local, or in-memory fallback)
    await connectDB();

    // 2. Create HTTP server wrapping express app
    const httpServer = http.createServer(app);

    // 3. Initialize Socket.IO with CORS
    const io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
        credentials: true,
      },
    });

    initSocket(io);

    // 4. Start listening
    httpServer.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` CivicConnect Server Running on Port ${PORT}`);
      console.log(` REST API: http://localhost:${PORT}/api/health`);
      console.log(` Real-Time WebSockets Ready`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Fatal Server Initialization Error:', error);
    process.exit(1);
  }
};

startServer();
