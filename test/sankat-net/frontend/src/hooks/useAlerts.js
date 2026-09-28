import { useCallback, useEffect, useState } from "react";
import alertsApi from "../api/alerts.api";
import { io } from "socket.io-client";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
export function useAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => { try { setAlerts(await alertsApi.getAlerts({ limit: 100 })); } finally { setLoading(false); } }, []);
  useEffect(() => { refresh().catch(()=>{}); const s=io(SOCKET_URL,{transports:["websocket"]}); const add=a=>setAlerts(x=>[a,...x.filter(v=>v._id!==a._id)]); s.on("alert:new",add); s.on("alert:update",add); return()=>s.disconnect(); },[refresh]);
  const acknowledge = useCallback(async id => { const a=await alertsApi.acknowledgeAlert(id); setAlerts(x=>x.map(v=>v._id===id||v.id===id?{...v,...a}:v)); },[]);
  const resolve = useCallback(async id => { const a=await alertsApi.resolveAlert(id); setAlerts(x=>x.map(v=>v._id===id||v.id===id?{...v,...a}:v)); },[]);
  return { alerts, loading, refresh, acknowledge, resolve };
}
