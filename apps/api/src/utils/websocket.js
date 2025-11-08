const emitToRoom = (room, event, data) => {
  if (global.io) {
    global.io.to(room).emit(event, data);
    console.log(`📡 Emitted ${event} to ${room}`);
  }
};

const broadcastUserUpdate = (action, userData) => {
  emitToRoom('users', 'user:update', {
    action,
    data: userData,
    timestamp: new Date().toISOString()
  });
};

const broadcastTokenUpdate = (action, tokenData) => {
  emitToRoom('tokens', 'token:update', {
    action,
    data: tokenData,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  emitToRoom,
  broadcastUserUpdate,
  broadcastTokenUpdate
};
