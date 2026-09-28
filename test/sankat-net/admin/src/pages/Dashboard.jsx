import { useMemo } from "react";
import MapView from "../components/MapView";

export default function Dashboard({data,navigate}) {
  const {nodes,alerts,packets,queue,stats,simulatePacket,triggerHazard}=data;
  return <section>
    <div className="grid-stats">
      <Stat label="Field nodes" value={nodes.length} sub={`${stats.online} online · ${nodes.length-stats.online} offline`} tone="green"/>
      <Stat label="Packets received" value={packets.toLocaleString()} sub="LoRa mesh · last 24h"/>
      <Stat label="Active alerts" value={stats.alerts} sub="Priority events" tone="red"/>
      <Stat label="Average risk" value={`${stats.risk}%`} sub="Network-wide risk score" tone="yellow"/>
      <Stat label="Gateway queue" value={queue} sub="Store-and-forward packets"/>
    </div>
    <div className="dashboard-grid">
      <div className="card map-card">
        <div className="card-head"><div><h2>Live Environmental Map</h2><p>GPS positions · hazard state · mesh topology</p></div>
          <div className="head-actions"><button className="btn" onClick={simulatePacket}>Transmit</button><button className="btn" onClick={()=>triggerHazard("FIRE")}>Demo event</button></div>
        </div><MapView nodes={nodes}/>
      </div>
      <div className="right-stack">
        <div className="card alerts-card"><div className="card-head"><div><h2>Priority Alerts</h2><p>Edge detection → gateway → backend</p></div><button className="btn" onClick={()=>navigate("alerts")}>View all</button></div>
          <div className="alert-list">{alerts.slice(0,5).map((a,i)=><div className="alert-row" key={i}><span className={`alert-bar ${a.priority==="CRITICAL"?"critical":"warn"}`}/><div><div className="alert-title">{a.hazard} · {a.node}</div><div className="alert-meta">{a.priority} · {a.confidence}% confidence · risk {a.risk}%</div></div><div className="alert-time">{a.time}</div></div>)}</div>
        </div>
        <div className="card pipeline"><div className="card-head compact"><div><h2>Data Pipeline</h2><p>Exact system flow</p></div></div>
          <div className="pipeline-flow">{["Sensors","ESP32","GPS","LoRa","Gateway","MQTT","AI Risk"].map((x,i)=><span key={x} className="pipeline-item">{i>0&&<b>›</b>}<em>{x}</em></span>)}</div>
        </div>
        <div className="card quick"><div className="card-head compact"><h2>Quick Actions</h2></div><div className="quick-grid">
          <button className="btn" onClick={simulatePacket}>Send telemetry</button><button className="btn" onClick={()=>triggerHazard("FIRE")}>Fire event</button>
          <button className="btn" onClick={()=>navigate("simulation")}>Open simulator</button><button className="btn" onClick={()=>navigate("network")}>Inspect mesh</button>
        </div></div>
      </div>
    </div>
  </section>
}
function Stat({label,value,sub,tone}) { return <div className="card stat"><div className="stat-label">{label}</div><div className={`stat-value ${tone?`dot-${tone}`:""}`}>{value}</div><div className="stat-sub">{sub}</div><div className="stat-accent"/></div> }