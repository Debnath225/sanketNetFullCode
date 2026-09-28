import Card from "../components/common/Card";

export default function NetworkMQTT({ telemetry: t }) {
  return (
    <section className="section active">
      <div className="device-layout">
        <Card>
          <div className="card-heading"><h3>Backend Connection</h3><span>Real-time transport</span></div>
          {[
            ["Status", t.connected ? "CONNECTED" : "DEMO MODE"],
            ["Transport", "Socket.IO / MQTT backend"],
            ["API", t.apiUrl],
            ["Data packets", String(t.packets)],
            ["Last packet", t.lastUpdate || "Waiting"]
          ].map(([a,b]) => <div className="info-row" key={a}><span className="info-label">{a}</span><span className="info-value">{b}</span></div>)}
        </Card>
        <Card>
          <div className="card-heading"><h3>MQTT Architecture</h3><span>Backend owned</span></div>
          <div className="topic-block">sankatnet/telemetry/&lt;NODE_ID&gt;</div>
          <div className="topic-block">sankatnet/status/&lt;NODE_ID&gt;</div>
          <div className="topic-block">sankatnet/alerts/&lt;NODE_ID&gt;</div>
          <p className="muted-note">The React dashboard does not expose MQTT credentials. MQTT ingestion remains inside the backend.</p>
        </Card>
      </div>
    </section>
  );
}
