// Connect to Socket.IO server and handle dashboard refresh events
const socket = io();

socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});

// Simple strategy: server will emit 'refresh' to signal clients to update
socket.on('refresh', (payload) => {
  console.log('Refresh event received', payload);
  // Full page reload for now to keep client logic simple and reliable
  location.reload();
});

socket.on('disconnect', () => {
  console.log('Socket disconnected');
});
