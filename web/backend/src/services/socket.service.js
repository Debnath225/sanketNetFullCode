let io;

export function initSocket(instance) {
  io = instance;
  io.on("connection", socket => {
    socket.emit("gateway:status", { online: true, gatewayId: "GW-FFFF" });
  });
}

export function broadcast(event, payload) {
  if (io) io.emit(event, payload);
}