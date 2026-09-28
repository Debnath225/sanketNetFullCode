import { useEffect, useRef } from "react";
import L from "leaflet";

function icon(color, label) {
  return L.divIcon({
    className:"sn-marker",
    html:`<span style="background:${color}">${label}</span>`,
    iconSize:[28,28],iconAnchor:[14,14]
  });
}
export default function MapView({nodes, simulation=false, origin}) {
  const ref=useRef(null), map=useRef(null), layers=useRef([]);
  useEffect(()=>{
    if(!ref.current||map.current)return;
    map.current=L.map(ref.current,{zoomControl:false}).setView([22.575,88.363],13);
    L.control.zoom({position:"bottomright"}).addTo(map.current);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap"}).addTo(map.current);
    return()=>{map.current?.remove();map.current=null};
  },[]);
  useEffect(()=>{
    if(!map.current)return;
    layers.current.forEach(x=>map.current.removeLayer(x)); layers.current=[];
    const gw=L.marker([22.575,88.363],{icon:icon("#6ea8fe","GW")}).addTo(map.current).bindPopup("<b>GW-FFFF</b><br>MQTT/TLS Gateway");
    layers.current.push(gw);
    nodes.forEach(n=>{
      const color=!n.online?"#ff5c68":n.risk>=80?"#ff5c68":n.risk>=55?"#f4c95d":"#39d98a";
      const m=L.marker([n.lat,n.lon],{icon:icon(color,n.id.slice(-2))}).addTo(map.current)
        .bindPopup(`<b>${n.id}</b><br>${n.role}<br>${n.hazard} · ${n.risk}%`);
      layers.current.push(m);
      if(simulation && origin===n.id) {
        const line=L.polyline([[n.lat,n.lon],[22.575,88.363]],{color:"#4cc9f0",weight:3,dashArray:"6 7"}).addTo(map.current);
        layers.current.push(line);
      }
    });
  },[nodes,simulation,origin]);
  return <div ref={ref} className="leaflet-map"/>;
}