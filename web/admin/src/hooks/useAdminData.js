import { useCallback, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import nodesApi from "../api/nodes.api";
import alertsApi from "../api/alerts.api";
import telemetryApi from "../api/telemetry.api";
import networkApi from "../api/network.api";
import simulationApi from "../api/simulation.api";

const SOCKET = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
const DEMO = import.meta.env.VITE_DEMO_MODE === "true";
const seedNodes=[
{id:"NODE-01",role:"Fire + Pollution",lat:22.579,lon:88.351,battery:82,tx:30,online:true,risk:0,hazard:"NORMAL"},
{id:"NODE-02",role:"Flood + Soil",lat:22.566,lon:88.372,battery:91,tx:45,online:true,risk:0,hazard:"NORMAL"},
{id:"NODE-03",role:"Seismic + Environment",lat:22.588,lon:88.381,battery:67,tx:30,online:false,risk:0,hazard:"NORMAL"},
{id:"NODE-04",role:"Water Quality",lat:22.558,lon:88.357,battery:76,tx:60,online:true,risk:0,hazard:"NORMAL"}
];
const mapNode=n=>({id:n.nodeId||n.node_id||n.nodeCode||n._id||n.id,role:n.role||n.type||"Field node",lat:Number(n.latitude??n.lat??0),lon:Number(n.longitude??n.lon??0),battery:Number(n.battery_pct??n.battery??n.batteryPct??0),tx:Number(n.txIntervalSec??n.tx??30),online:Boolean(n.online??n.isOnline??true),risk:Number(n.riskScore??n.risk??0),hazard:String(n.hazard??"NORMAL").toUpperCase()});
const mapTelemetry=r=>({time:new Date(r.timestamp||r.receivedAt||Date.now()).toLocaleTimeString(),temp:Number(r.temperature_c??r.temperature??0).toFixed(2),hum:Number(r.humidity_pct??r.humidity??0).toFixed(2),pressure:Math.round(r.pressure_hpa??r.pressure??0),mq2:Number(r.gas_voltage??r.mq2??0),mq135:Number(r.mq135??0),water:Number(r.water_level_pct??r.water??0),soil:Number(r.soil_moisture_pct??r.soil??r.soil_sat??0),risk:Number(r.riskScore??r.risk??0)});

export function useAdminData(){
 const [nodes,setNodes]=useState(DEMO?seedNodes:[]),[alerts,setAlerts]=useState([]),[telemetry,setTelemetry]=useState({}),[logs,setLogs]=useState([]),[packets,setPackets]=useState(0),[queue,setQueue]=useState(0),[backendLive,setBackendLive]=useState(false);
 const addLog=useCallback((type,message,tone="ok")=>setLogs(p=>[[type,message,tone],...p].slice(0,100)),[]);
 const load=useCallback(async()=>{try{const [ns,as,net]=await Promise.all([nodesApi.getNodes(),alertsApi.getAlerts({limit:100}),networkApi.getNetworkStatus()]); const arr=Array.isArray(ns)?ns:(ns?.nodes||[]); setNodes(arr.map(mapNode)); setAlerts(Array.isArray(as)?as:(as?.alerts||[])); setQueue(Number(net?.queueDepth??net?.queue??0)); setBackendLive(true);}catch(e){setBackendLive(false); if(!DEMO)addLog("ERROR",e.message,"warn");}},[addLog]);
 useEffect(()=>{ if(DEMO)return; load(); const s=io(SOCKET,{transports:["websocket"]}); const onTelemetry=r=>{const raw=r?.telemetry||r; const id=String(raw.nodeId||raw.node_id||"NODE-UNKNOWN"); setTelemetry(p=>({...p,[id]:[mapTelemetry(raw),...(p[id]||[])].slice(0,50)})); setNodes(p=>{const i=p.findIndex(n=>n.id===id); const live=mapNode({...raw,nodeId:id}); return i<0?[...p,live]:p.map((n,j)=>j===i?{...n,...live}:n)}); setPackets(p=>p+1);}; const onAlert=a=>setAlerts(p=>[a,...p]); const onStatus=n=>setNodes(p=>p.map(x=>x.id===String(n.nodeId||n.id)?{...x,...mapNode(n)}:x)); s.on("connect",()=>setBackendLive(true));s.on("disconnect",()=>setBackendLive(false));s.on("telemetry:new",onTelemetry);s.on("alert:new",onAlert);s.on("node:status",onStatus); return()=>s.disconnect(); },[load]);
 const simulatePacket=useCallback(async()=>{try{await simulationApi.createSimulationEvent({type:"TELEMETRY",nodeId:nodes[0]?.id}); addLog("TX","Test telemetry event submitted to backend.","ok");}catch(e){addLog("ERROR",e.message,"warn");}},[nodes,addLog]);
 const addNode=useCallback(async node=>{try{const created=await nodesApi.createNode(node);setNodes(p=>[...p,mapNode(created||node)]);addLog("NODE",`${node.id} registered.`);}catch(e){addLog("ERROR",e.message,"warn");throw e;}},[addLog]);
 const deleteNode=useCallback(async id=>{try{await nodesApi.deleteNode(id);setNodes(p=>p.filter(n=>n.id!==id));addLog("NODE",`${id} removed.`);}catch(e){addLog("ERROR",e.message,"warn");}},[addLog]);
 const triggerHazard=useCallback(async type=>{try{const result=await simulationApi.createSimulationEvent({type:"HAZARD",hazard:type,nodeId:nodes[0]?.id,intensity:80});if(result?.alert)setAlerts(p=>[result.alert,...p]);addLog("ALERT",`${type} simulation submitted.`);}catch(e){addLog("ERROR",e.message,"warn");}},[nodes,addLog]);
 const clearAlerts=useCallback(()=>setAlerts([]),[]),clearLogs=useCallback(()=>setLogs([]),[]);
 const stats=useMemo(()=>({online:nodes.filter(n=>n.online).length,alerts:alerts.filter(a=>String(a.state||a.status||"").toUpperCase()==="ACTIVE").length,risk:nodes.length?Math.round(nodes.reduce((s,n)=>s+n.risk,0)/nodes.length):0}),[nodes,alerts]);
 return {nodes,alerts,telemetry,logs,packets,queue,backendLive,stats,simulatePacket,addNode,deleteNode,triggerHazard,addLog,clearLogs,clearAlerts};
}
