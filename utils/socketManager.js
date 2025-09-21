const { Server } = require('socket.io');
let io;
let refreshInterval;

function startAutoRefresh(intervalMs = 5000) {
    if (!io) throw new Error('Socket.IO not initialized');
    stopAutoRefresh();
    refreshInterval = setInterval(() => {
        // Emit a lightweight refresh event. Payload can be extended later.
        io.emit('refresh', { ts: Date.now() });
    }, intervalMs);
}

function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

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
    startAutoRefresh,
    stopAutoRefresh,
};