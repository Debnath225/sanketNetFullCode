import Card from "../components/common/Card";

export default function DeviceHealth({ telemetry: t }) {
  const health = t.battery >= 20 ? t.battery : 0;
  return (
    <section className="section active">
      <div className="device-layout">
        <Card>
          <div className="card-heading"><h3>Node Health</h3><span>ESP32-S3</span></div>
          <div className="health">
            <div className="health-circle">{health.toFixed(0)}%</div>
            <div className="health-text">
              <strong>{t.lastUpdate ? "Operational" : "Waiting for node"}</strong>
              <span>Field sensing node status</span>
            </div>
          </div>
          {[
            ["Device", "ESP32-S3"],
            ["Battery", `${t.battery.toFixed(0)} %`],
            ["Battery voltage", `${t.batteryVolts.toFixed(2)} V`],
            ["Last packet", t.lastUpdate || "Waiting"],
            ["Packets received", String(t.packets)],
            ["Hazard state", t.hazard]
          ].map(([a,b]) => <div className="info-row" key={a}><span className="info-label">{a}</span><span className="info-value">{b}</span></div>)}
        </Card>
        <Card>
          <div className="card-heading"><h3>Sensor Health</h3><span>Runtime</span></div>
          {["Water level", "Temperature", "MQ-2 Gas", "BMP180 Pressure", "MPU6050 Motion"].map(name =>
            <div className="info-row" key={name}><span className="info-label">{name}</span><span className="badge safe">READY</span></div>
          )}
        </Card>
      </div>
    </section>
  );
}
