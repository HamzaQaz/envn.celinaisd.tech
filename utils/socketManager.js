const { Server } = require('socket.io');
let io;
// Note: dashboard updates are emitted by server.js using dashboardData

module.exports = {
    init: (httpServer) => {
        io = new Server(httpServer);

        io.on('connection', (socket) => {
            console.log('Socket connected:', socket.id);
        });
        return io;

    },
    getIo: () => {
        if (!io) throw new Error('Socket.IO not initialized!');
        return io;
    },
    // keep interface minimal
};