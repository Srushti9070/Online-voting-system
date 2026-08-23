require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Initialize Express Application
const app = express();

// Create HTTP Server for Express and Socket.io integration
const server = http.createServer(app);

// Connect to MongoDB Database
connectDB();

// Global Middleware Configuration - Mobile & Local Network Permissive CORS
app.use(cors({
  origin: true, // Allows requests from localhost, 127.0.0.1, and mobile Wi-Fi IP (e.g. 192.168.1.20)
  credentials: true
}));

// Increase JSON payload limit to handle biometric face descriptor data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Socket.io Real-Time Server
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Attach Socket.io instance to Express App for controller access
app.set('io', io);

// Socket.io Connection Logic for Real-Time Vote Counting & Analytics
io.on('connection', (socket) => {
  console.log(`🔌 New WebSockets Client Connected: ${socket.id}`);

  // Join a specific election real-time room for live updates
  socket.on('join_election_room', (electionId) => {
    socket.join(electionId);
    console.log(`📌 Socket ${socket.id} joined Election Room: ${electionId}`);
  });

  // Client disconnection event
  socket.on('disconnect', () => {
    console.log(`❌ WebSockets Client Disconnected: ${socket.id}`);
  });
});

// Basic System Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'TrustVote Secure Blockchain Online Voting System API Active',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Register API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));
app.use('/api/elections', require('./routes/electionRoutes'));
app.use('/api/candidates', require('./routes/candidateRoutes'));
app.use('/api/votes', require('./routes/voteRoutes'));
app.use('/api/blockchain', require('./routes/blockchainRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));


// Port Definition & Server Startup
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`==================================================`);
  console.log(`⚡ Express Voting API Server running on port ${PORT}`);
  console.log(`🌐 Local Network Access : http://192.168.1.20:${PORT}`);
  console.log(`📡 Socket.io Server Active & Listening for Events`);
  console.log(`==================================================`);
});
