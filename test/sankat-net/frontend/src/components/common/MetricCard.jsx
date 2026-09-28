export default function MetricCard({ title, value, unit, icon, footerLeft, footerRight, progress }) {
  return (
    <div className="card metric">
      <div className="card-head">
        <span className="card-title">{title}</span>
        <span className="sensor-icon">{icon}</span>
      </div>
      <div className="metric-value">{value ?? "--"} {unit && <small>{unit}</small>}</div>
      {progress !== undefined && (
        <div className="progress"><span style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} /></div>
      )}
      <div className="metric-footer">
        <span>{footerLeft}</span>
        <span>{footerRight}</span>
      </div>
    </div>
  );
}
