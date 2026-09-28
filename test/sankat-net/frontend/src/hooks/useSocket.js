/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
export function useSocket(events = {}) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const newSocket = io(SOCKET_URL, { transports: ["websocket"], autoConnect: true });
    setSocket(newSocket);
    newSocket.on("connect", () => setConnected(true));
    newSocket.on("disconnect", () => setConnected(false));
    Object.entries(events).forEach(([event, handler]) => newSocket.on(event, handler));
    return () => { Object.entries(events).forEach(([event, handler]) => newSocket.off(event, handler)); newSocket.disconnect(); setSocket(null); };
  }, []);
  return { socket, connected };
}
