import { useMemo, useState } from "react";
export default function FieldNodes({data}) {
  const [q,setQ]=useState("");
  const rows=useMemo(()=>data.nodes.filter(n=>`${n.id} ${n.role} ${n.hazard}`.toLowerCase().includes(q.toLowerCase())),[data.nodes,q]);
  const exportNodes=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(data.nodes,null,2)],{type:"application/json"}));a.download="sankat-net-nodes.json";a.click();URL.revokeObjectURL(a.href)};
  return <section><SectionTitle title="Field Nodes" sub="Manage node identity, position, connectivity and sensor role."/><div className="card">
    <div className="toolbar"><input className="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search node ID or type..."/><div className="toolbar-right"><button className="btn" onClick={exportNodes}>Export JSON</button></div></div>
    <div className="table-wrap"><table><thead><tr><th>Node</th><th>Role</th><th>Location</th><th>Battery</th><th>Risk</th><th>Hazard</th><th>Status</th><th>Actions</th></tr></thead><tbody>{rows.map(n=><tr key={n.id}>
      <td><b>{n.id}</b></td><td><span className="tag">{n.role}</span></td><td>{n.lat.toFixed(4)}, {n.lon.toFixed(4)}</td><td>{n.battery}%</td>
      <td className={`risk ${n.risk>=80?"high":n.risk>=55?"med":"low"}`}>{n.risk}%</td><td>{n.hazard}</td>
      <td><span className={`status ${n.online?"":"off"}`}><i/>{n.online?"ONLINE":"OFFLINE"}</span></td>
      <td><button className="btn danger small-btn" onClick={()=>data.deleteNode(n.id)}>Remove</button></td>
    </tr>)}</tbody></table></div>
  </div></section>
}
function SectionTitle({title,sub}){return <div className="section-title"><h2>{title}</h2><p>{sub}</p></div>}