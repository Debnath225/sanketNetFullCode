import { useEffect, useMemo, useState } from "react";
import { Menu, Plus, Send, X, LogOut } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import FieldNodes from "./pages/FieldNodes";
import MeshNetwork from "./pages/MeshNetwork";
import AlertsEvents from "./pages/AlertsEvents";
import LiveTelemetry from "./pages/LiveTelemetry";
import DisasterSimulation from "./pages/DisasterSimulation";
import SystemArchitecture from "./pages/SystemArchitecture";
import { useAdminData } from "./hooks/useAdminData";

const views = {
  dashboard: ["Environmental Intelligence Control Center", "Real-time digital twin of the Sankat-Net disaster monitoring network"],
  nodes: ["Field Nodes", "Manage node identity, position, connectivity and sensor role."],
  network: ["LoRa Mesh Network", "Every field node can sense, receive and forward authenticated traffic."],
  alerts: ["Alerts & Events", "Localized hazard intelligence generated at the edge and propagated through the mesh."],
  telemetry: ["Live Telemetry", "Backend representation of the compact encrypted LoRa sensor payload."],
  simulation: ["Disaster Simulation", "Demonstrate localized detection, packet routing and risk escalation without physical hardware."],
  architecture: ["System Architecture", "Sankat-Net end-to-end resilient environmental monitoring stack."]
};

export default function App() {
  const [view, setView] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modal, setModal] = useState(false);
  const data = useAdminData();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!mobileOpen) return;
    const close = e => { if (e.key === "Escape") setMobileOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [mobileOpen]);

  const navigate = next => {
    setView(next);
    setMobileOpen(false);
  };

  const meta = views[view];

  const content = useMemo(() => {
    const p = { data, navigate };
    switch (view) {
      case "nodes": return <FieldNodes {...p} />;
      case "network": return <MeshNetwork {...p} />;
      case "alerts": return <AlertsEvents {...p} />;
      case "telemetry": return <LiveTelemetry {...p} />;
      case "simulation": return <DisasterSimulation {...p} />;
      case "architecture": return <SystemArchitecture />;
      default: return <Dashboard {...p} />;
    }
  }, [view, data, navigate]);

  return (
    <div className="app">
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="logo">SN</div>
          <div><strong>Sankat-Net</strong><span>Resilience Control</span></div>
        </div>
        <nav className="nav">
          {[
            ["dashboard","◈","Control Center"],
            ["nodes","⌁","Field Nodes"],
            ["network","⌘","Mesh Network"],
            ["alerts","!","Alerts & Events"],
            ["telemetry","▥","Telemetry"],
            ["simulation","◎","Disaster Simulation"],
            ["architecture","△","System Architecture"]
          ].map(([key,icon,label]) =>
            <button key={key} className={view===key?"active":""} onClick={()=>navigate(key)}>
              <span className="ico">{icon}</span>{label}
            </button>
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="gateway-mini">
            <div className="gateway-title"><span className="dot"/>Gateway online</div>
            <div className="small">GW-FFFF · MQTT/TLS · Wi-Fi</div>
            <div className="small gateway-sub">LoRa mesh receiving</div>
          </div>
          <div style={{margin:"10px 0",padding:"10px 0",borderTop:"1px solid rgba(255,255,255,.06)"}}>
            <div style={{fontSize:"11px",color:"#52667c",marginBottom:"6px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.email}</div>
            <button onClick={logout} style={{display:"flex",alignItems:"center",gap:"6px",background:"none",border:"none",color:"#ef4444",fontSize:"12px",cursor:"pointer",padding:"2px 0"}}>
              <LogOut size={13}/> Sign Out
            </button>
          </div>
          <div className="sidebar-footer">
            AI-assisted environmental intelligence<br/>
            Local edge detection · Mesh resilience · Store & forward
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="top-left">
            <button className="btn mobile-menu" onClick={()=>setMobileOpen(true)}><Menu size={17}/></button>
            <div className="page-title">
              <h1>{meta[0]}</h1><p>{meta[1]}</p>
            </div>
          </div>
          <div className="top-actions">
            <span className="badge"><span className="dot"/> SYSTEM OPERATIONAL</span>
            <button className="btn" onClick={data.simulatePacket}><Send size={12}/> Transmit Test Packet</button>
            <button className="btn primary" onClick={()=>setModal(true)}><Plus size={13}/> Add Node</button>
          </div>
        </header>
        <div className="content">{content}</div>
      </main>

      {modal && <NodeModal data={data} onClose={()=>setModal(false)}/>}
    </div>
  );
}

function NodeModal({data,onClose}) {
  const [form,setForm]=useState({
    id:`NODE-${String(data.nodes.length+1).padStart(2,"0")}`,
    role:"Fire + Pollution",lat:"22.575",lon:"88.363",battery:"90",tx:"30",online:true
  });
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const submit=e=>{
    e.preventDefault();
    data.addNode({...form,lat:Number(form.lat),lon:Number(form.lon),battery:Number(form.battery),tx:Number(form.tx)});
    onClose();
  };
  return <div className="modal-backdrop show">
    <form className="modal" onSubmit={submit}>
      <div className="modal-head"><h3>Add Field Node</h3><button type="button" className="close" onClick={onClose}><X size={19}/></button></div>
      <div className="form-grid">
        <Field label="Node ID"><input value={form.id} onChange={e=>set("id",e.target.value)} required/></Field>
        <Field label="Role"><select value={form.role} onChange={e=>set("role",e.target.value)}>{["Fire + Pollution","Flood + Soil","Seismic + Environment","Water Quality"].map(x=><option key={x}>{x}</option>)}</select></Field>
        <Field label="Latitude"><input type="number" step="any" value={form.lat} onChange={e=>set("lat",e.target.value)} required/></Field>
        <Field label="Longitude"><input type="number" step="any" value={form.lon} onChange={e=>set("lon",e.target.value)} required/></Field>
        <Field label="Battery %"><input type="number" min="0" max="100" value={form.battery} onChange={e=>set("battery",e.target.value)}/></Field>
        <Field label="TX interval (sec)"><input type="number" min="1" value={form.tx} onChange={e=>set("tx",e.target.value)}/></Field>
      </div>
      <div className="form-actions"><button type="button" className="btn" onClick={onClose}>Cancel</button><button className="btn primary">Create node</button></div>
    </form>
  </div>
}
function Field({label,children}) { return <div className="field"><label>{label}</label>{children}</div> }