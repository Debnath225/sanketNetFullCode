import { Menu, Radio } from "lucide-react";

export default function Topbar({ meta, connected, onMenu }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-menu" onClick={onMenu} aria-label="Open navigation">
          <Menu size={21} />
        </button>
        <div className="page-title">
          <h1>{meta[0]}</h1>
          <p>{meta[1]}</p>
        </div>
      </div>

      <div className="top-actions">
        <div className="clock">
          {new Date().toLocaleTimeString([], { hour12: false })}
        </div>
        <div className={`connection ${connected ? "connected" : "disconnected"}`}>
          <Radio size={13} />
          <span>{connected ? "BACKEND LIVE" : "DEMO MODE"}</span>
        </div>
      </div>
    </header>
  );
}
