import { Link } from "react-router-dom";
import { Activity, AlertTriangle, ShieldCheck } from "lucide-react";

export default function Landing() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", padding: "0 30px" }}>
      <header style={{ padding: "20px 0", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="logo-icon"><ShieldCheck size={24} /></div>
          <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>SANKAT-NET</h2>
        </div>
        <nav style={{ display: "flex", gap: "15px" }}>
          <Link to="/auth" style={{ color: "var(--text)", textDecoration: "none", padding: "10px 20px", borderRadius: "10px", background: "rgba(255,255,255,0.05)" }}>Login</Link>
          <Link to="/auth" style={{ color: "#fff", textDecoration: "none", padding: "10px 20px", borderRadius: "10px", background: "var(--blue)" }}>Get Started</Link>
        </nav>
      </header>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", maxWidth: "900px", margin: "0 auto", padding: "60px 0" }}>
        <div style={{ display: "inline-block", padding: "8px 16px", background: "rgba(14, 165, 233, 0.15)", color: "var(--blue)", borderRadius: "20px", fontSize: "13px", fontWeight: "bold", marginBottom: "20px" }}>
          Environmental Intelligence Platform
        </div>
        <h1 style={{ fontSize: "56px", fontWeight: "800", lineHeight: "1.2", marginBottom: "20px", background: "linear-gradient(to right, #fff, #9badc0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Real-time hazard detection.<br />Distributed sensor intelligence.
        </h1>
        <p style={{ fontSize: "18px", color: "var(--muted)", maxWidth: "600px", lineHeight: "1.6", marginBottom: "40px" }}>
          Monitor floods, landslides, and environmental risks in real-time with our advanced mesh-network sensor nodes and predictive analytics.
        </p>
        
        <div style={{ display: "flex", gap: "20px" }}>
          <Link to="/auth" style={{ color: "#fff", textDecoration: "none", padding: "15px 30px", borderRadius: "12px", background: "linear-gradient(135deg, #0ea5e9, #2563eb)", fontSize: "16px", fontWeight: "bold", boxShadow: "0 8px 25px rgba(14,165,233,0.3)" }}>
            Go to Dashboard
          </Link>
        </div>

        <div className="grid" style={{ marginTop: "80px", textAlign: "left", width: "100%" }}>
          <div className="card">
            <Activity color="var(--blue)" size={32} style={{ marginBottom: "15px" }} />
            <h3 style={{ fontSize: "18px", marginBottom: "10px" }}>Live Telemetry</h3>
            <p style={{ color: "var(--muted)", fontSize: "13px", lineHeight: "1.5" }}>Ingest real-time data from hundreds of ESP32-based sensor nodes instantly.</p>
          </div>
          <div className="card">
            <AlertTriangle color="var(--red)" size={32} style={{ marginBottom: "15px" }} />
            <h3 style={{ fontSize: "18px", marginBottom: "10px" }}>Hazard Intelligence</h3>
            <p style={{ color: "var(--muted)", fontSize: "13px", lineHeight: "1.5" }}>Automatically classify risks based on water levels, pressure, and motion data.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
