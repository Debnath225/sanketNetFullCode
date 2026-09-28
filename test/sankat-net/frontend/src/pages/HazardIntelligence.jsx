const hazards = [
  ["🔥", "Forest Fire", "Temperature, gas/smoke and environmental trend analysis", "FIRE"],
  ["≋", "Flood", "Water-level and rainfall-driven flood indication", "FLOOD"],
  ["⌁", "Landslide", "Motion, slope and soil-condition based detection", "LANDSLIDE"],
  ["◌", "Pollution", "Gas and air-quality sensor intelligence", "POLLUTION"]
];

export default function HazardIntelligence({ telemetry: t }) {
  return (
    <section className="section active">
      <div className="hazard-grid">
        {hazards.map(([symbol, title, desc, type]) => {
          const active = t.hazard === type;
          return (
            <div className={`hazard-card ${active ? "active" : ""}`} key={type}>
              <div className="hazard-symbol">{symbol}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
              <div className="hazard-state">{active ? "● ACTIVE" : "● NORMAL"}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
