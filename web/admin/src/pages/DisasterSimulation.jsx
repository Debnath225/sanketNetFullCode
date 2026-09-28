import { useState } from "react";
import MapView from "../components/MapView";
export default function DisasterSimulation({data}) {
  const [origin,setOrigin]=useState(data.nodes[0]?.id||"NODE-01");
  const [intensity,setIntensity]=useState(70);
  const [hops,setHops]=useState(3);
  const [status,setStatus]=useState("Ready. Select a hazard to inject an event.");
  const fire=type=>{data.triggerHazard(type);setStatus(`${type} injected at ${origin} · Risk escalation simulated · ${hops} packet hops · intensity ${intensity}%.`)};
  return <section><div className="section-title"><h2>Disaster Simulation</h2><p>Demonstrate localized detection, packet routing and risk escalation without physical hardware.</p></div>
    <div className="sim-layout"><div className="card control-card"><h3>Event Controls</h3>
      <div className="control-row"><label><span>Origin node</span><b>{origin}</b></label><select className="search" value={origin} onChange={e=>setOrigin(e.target.value)}>{data.nodes.map(n=><option key={n.id}>{n.id}</option>)}</select></div>
      <div className="control-row"><label><span>Intensity</span><b>{intensity}%</b></label><input type="range" min="10" max="100" value={intensity} onChange={e=>setIntensity(e.target.value)}/></div>
      <div className="control-row"><label><span>Packet hops</span><b>{hops}</b></label><input type="range" min="1" max="5" value={hops} onChange={e=>setHops(e.target.value)}/></div>
      <h3 className="control-subtitle">Hazard injection</h3><div className="event-buttons">
        {["FIRE","FLOOD","SEISMIC","POLLUTION"].map(x=><button className="btn" key={x} onClick={()=>fire(x)}>{x==="FIRE"?"🔥":x==="FLOOD"?"💧":x==="SEISMIC"?"〽":"☁"} {x[0]+x.slice(1).toLowerCase()}</button>)}
      </div><button className="btn danger reset" onClick={()=>setStatus("Simulation reset. Network returned to baseline.")}>Reset simulation</button>
      <div className="sim-status"><strong>{status}</strong></div>
    </div><div className="card sim-map"><MapView nodes={data.nodes} simulation origin={origin}/></div></div>
  </section>
}