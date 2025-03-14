const { Server } = require("socket.io");
const { deviceEventEmitter } = require("./connectMqtt");

let io;
const eventBuffer = new Map();

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 New client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);
    });
  });

  const debounceEmit = (eventName, data) => {
    clearTimeout(eventBuffer.get(eventName));
    eventBuffer.set(
      eventName,
      setTimeout(() => {
        io.emit(eventName, data);
        console.log(`📢 Emitting ${eventName}:`, data);
        eventBuffer.delete(eventName);
      }, 1000) // 1-second delay
    );
  };

  // Listen for device status changes (debounced)
  deviceEventEmitter.on("deviceStatusChange", (data) => {
    debounceEmit("deviceStatusUpdate", data);
  });

  // Listen for device added/removed events (debounced)
  deviceEventEmitter.on("deviceChange", (data) => {
    debounceEmit("deviceChange", data);
  });

  // Listen for danger alerts (debounced)
  deviceEventEmitter.on("dangerAlert", (data) => {
    debounceEmit("dangerAlert", data);
  });
};

module.exports = { initializeSocket, io };
