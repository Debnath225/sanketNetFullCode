import Card from "../components/common/Card";

const sensors = [
  ["Temperature", "temp", "°C", 100],
  ["Gas / Smoke", "gas", "V", 3.3],
  ["Pressure", "pressure", "hPa", 1100],
  ["Acceleration X", "accelX", "m/s²", 10],
  ["Acceleration Y", "accelY", "m/s²", 10],
  ["Acceleration Z", "accelZ", "m/s²", 15],
  ["Battery", "battery", "%", 100],
  ["Water Level", "water", "%", 100]
];

export default function LiveSensors({ telemetry: t }) {
  return (
    <section className="section active">
      <div className="sensor-list">
        {sensors.map(([label, key, unit, max]) => {
          const value = Number(t[key] ?? 0);
          const pct = Math.min(100, Math.abs(value) / max * 100);
          return (
            <Card className="sensor-row" key={key}>
              <div className="sensor-row-head">
                <span className="sensor-row-name">{label}</span>
                <span className="sensor-row-value">{value.toFixed(2)} {unit}</span>
              </div>
              <div className="bar"><span style={{width: `${pct}%`}} /></div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
