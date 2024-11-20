// client.js

const chalk = require('chalk');
const io = require('socket.io-client');
const readline = require('readline');

// Connect to the server
const socket = io('http://localhost:3000');

// Set up readline interface for command-line input/output
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Store the username
let username = '';

// Function to prompt for a username
function askForUsername() {
  rl.question('Enter your username: ', (name) => {
    username = name.trim() || 'Anonymous';
    socket.emit('setUsername', username);
    console.log(chalk.green(`Welcome, ${username}! You can start chatting now.`));
    rl.setPrompt(`${username}: `);
    rl.prompt();
  });
}

// Handle incoming messages from the server
socket.on('message', (msg) => {
  console.log(`\n${chalk.blue(msg)}`);
  rl.prompt();
});

// Notify the user upon successful connection
socket.on('connect', () => {
  askForUsername();
});

// Handle disconnection
socket.on('disconnect', () => {
  console.log('Disconnected from the server.');
  process.exit(0);
});

// Read input from the user and send it to the server
rl.on('line', (line) => {
  const message = line.trim();
  if (message.toLowerCase() === '/quit') {
    socket.disconnect();
    rl.close();
  } else if (message.toLowerCase() === '/users') {
    socket.emit('listUsers');
  } else {
    socket.emit('message', message);
  }
  rl.prompt();
});

// Handle Ctrl+C to exit gracefully
rl.on('SIGINT', () => {
  socket.disconnect();
  rl.close();
});
