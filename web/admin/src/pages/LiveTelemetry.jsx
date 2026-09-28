import { useState } from "react";
export default function LiveTelemetry({data}) {
  const [node,setNode]=useState(data.nodes[0]?.id||"");
  const rows=data.telemetry[node]||[];
  return <section><div className="section-title"><h2>Live Telemetry</h2><p>Backend representation of the compact encrypted LoRa sensor payload.</p></div>
    <div className="card"><div className="toolbar"><div className="toolbar-left"><select className="search" value={node} onChange={e=>setNode(e.target.value)}>{data.nodes.map(n=><option key={n.id}>{n.id}</option>)}</select><button className="btn" onClick={data.simulatePacket}>Generate reading</button></div><span className="small">MQTT topic: sankatnet/telemetry/&lt;NODE&gt;</span></div>
    <div className="table-wrap"><table><thead><tr><th>Timestamp</th><th>Temperature</th><th>Humidity</th><th>Pressure</th><th>MQ2</th><th>MQ135</th><th>Water</th><th>Soil</th><th>Risk</th></tr></thead><tbody>{rows.map((r,i)=><tr key={i}><td>{r.time}</td><td>{r.temp}°C</td><td>{r.hum}%</td><td>{r.pressure}</td><td>{r.mq2}</td><td>{r.mq135}</td><td>{r.water}%</td><td>{r.soil}%</td><td className={`risk ${r.risk>=80?"high":r.risk>=55?"med":"low"}`}>{r.risk}%</td></tr>)}</tbody></table></div></div>
  </section>
}