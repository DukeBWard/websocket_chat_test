// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Create an Express app
const app = express();

// Create an HTTP server
const server = http.createServer(app);

// Attach Socket.IO to the server
const io = socketIo(server);

// Store connected clients and their usernames
const clients = {};

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Default username until set by the client
  socket.username = 'Anonymous';

  // Handle setting of username
  socket.on('setUsername', (username) => {
    socket.username = username || 'Anonymous';
    clients[socket.id] = socket.username;
    console.log(`User connected: ${socket.username} (${socket.id})`);

    // Notify other clients that a new user has joined
    socket.broadcast.emit('message', `${socket.username} has joined the chat.`);
  });

  // Listen for incoming messages from clients
  socket.on('message', (msg) => {
    console.log(`Message from ${socket.username}: ${msg}`);

    // Broadcast the message to all other clients
    socket.broadcast.emit('message', `${socket.username}: ${msg}`);
  });

    // Handle request to list users
  socket.on('listUsers', () => {
    const userList = Object.values(clients);
    socket.emit('message', `Online Users: ${userList.join(', ')}`);
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.username} (${socket.id})`);

    // Remove the client from the clients object
    delete clients[socket.id];

    // Notify other clients that a user has left
    socket.broadcast.emit('message', `${socket.username} has left the chat.`);
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
