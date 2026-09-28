export default function EventLog({ telemetry: t }) {
  return (
    <section className="section active">
      <div className="card">
        <div className="card-heading">
          <h3>Hazard Event Log</h3>
          <span>{t.events.length} event{t.events.length === 1 ? "" : "s"}</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Time</th><th>Hazard</th><th>Water</th><th>Temperature</th><th>Gas</th><th>Acceleration</th><th>State</th></tr></thead>
            <tbody>
              {t.events.length === 0 ? (
                <tr><td colSpan="7" className="empty">No hazard events recorded</td></tr>
              ) : t.events.map(e => (
                <tr key={e.id}>
                  <td>{e.time}</td><td><strong className="danger-text">{e.type}</strong></td>
                  <td>{e.water.toFixed(1)}%</td><td>{e.temp.toFixed(1)}°C</td>
                  <td>{e.gas.toFixed(2)}V</td><td>{e.accel.toFixed(2)}m/s²</td>
                  <td><span className="badge danger">ALERT</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
