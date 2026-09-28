import { Activity, AlertTriangle, Cpu, Home, List, Network, ShieldCheck, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const primary = [
  ["overview", "Overview", Home],
  ["sensors", "Live Sensors", Activity],
  ["hazards", "Hazard Intelligence", AlertTriangle],
  ["events", "Event Log", List]
];

const system = [
  ["device", "Device Health", Cpu],
  ["network", "Network / MQTT", Network]
];

export default function Sidebar({ active, open, connected, onNavigate }) {
  const { logout } = useAuth();
  const NavButton = ({ item }) => {
    const [key, label, Icon] = item;
    return (
      <button className={`nav-button ${active === key ? "active" : ""}`} onClick={() => onNavigate(key)}>
        <span className="nav-icon"><Icon size={16} strokeWidth={1.8} /></span>
        {label}
      </button>
    );
  };

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="logo">
        <div className="logo-icon"><ShieldCheck size={21} /></div>
        <div>
          <h2>SANKAT-NET</h2>
          <span>ENVIRONMENTAL INTELLIGENCE</span>
        </div>
      </div>

      <div className="nav-title">Monitoring</div>
      <nav className="nav">{primary.map(item => <NavButton key={item[0]} item={item} />)}</nav>

      <div className="nav-title system-nav-title">System</div>
      <nav className="nav">{system.map(item => <NavButton key={item[0]} item={item} />)}</nav>

      <div className="sidebar-bottom">
        <div className="system-mini">
          <div className="system-mini-label">System connection</div>
          <div className="system-mini-value">
            <span className={`dot ${connected ? "online-dot" : "offline-dot"}`} />
            <span>{connected ? "Backend connected" : "Offline / demo mode"}</span>
          </div>
        </div>
        <div className="system-mini" style={{ marginTop: "12px" }}>
          <button 
            onClick={logout} 
            style={{ width: "100%", background: "none", border: "none", color: "var(--red)", fontSize: "12px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "4px" }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
