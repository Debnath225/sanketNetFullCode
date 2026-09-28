export default function MeshNetwork({data}) {
  const routes=data.nodes.map((n,i)=>({n,next:i===data.nodes.length-1?"GW-FFFF":data.nodes[i+1]?.id||"GW-FFFF"}));
  return <section><div className="section-title"><h2>LoRa Mesh Network</h2><p>Every field node can sense, receive and forward authenticated traffic.</p></div>
    <div className="two-col"><div className="card"><div className="card-head"><div><h2>Topology</h2><p>Dynamic next-hop routing</p></div><button className="btn" onClick={()=>data.addLog("ROUTE","Mesh routes recalculated · next-hop table refreshed.","ok")}>Re-route</button></div>
      <div className="topology">{routes.map(r=><div className="route" key={r.n.id}><strong>{r.n.id}</strong><span>→</span><b>{r.next}</b><small>{r.n.online?"ONLINE":"OFFLINE"} · TTL 8</small></div>)}</div>
    </div><div className="card"><div className="card-head"><div><h2>Packet Log</h2><p>LoRa → verification → routing → MQTT</p></div><button className="btn" onClick={data.clearLogs}>Clear</button></div>
      <div className="log">{data.logs.map((x,i)=><div className="log-line" key={i}><b className={x[2]}>{x[0]}</b> · {x[1]}</div>)}</div>
    </div></div>
  </section>
}