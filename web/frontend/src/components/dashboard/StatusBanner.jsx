import { CheckCircle2, Siren } from "lucide-react";

export default function StatusBanner({ hazard, lastUpdate }) {
  const danger = hazard !== "NORMAL";
  return (
    <div className={`alert ${danger ? "danger" : ""}`}>
      <div className="alert-left">
        <div className="alert-icon">{danger ? <Siren size={25} /> : <CheckCircle2 size={25} />}</div>
        <div>
          <div className="alert-label">Environmental Status</div>
          <div className="alert-title">{danger ? `${hazard} RISK DETECTED` : "SYSTEM NORMAL"}</div>
          <div className="alert-sub">
            {danger ? "Environmental conditions require attention" : "No environmental hazards detected"}
          </div>
        </div>
      </div>
      <div className="alert-time">
        LAST DATA PACKET
        <strong>{lastUpdate || "Waiting..."}</strong>
      </div>
    </div>
  );
}
