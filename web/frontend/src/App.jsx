import { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import Overview from "./pages/Overview";
import LiveSensors from "./pages/LiveSensors";
import HazardIntelligence from "./pages/HazardIntelligence";
import EventLog from "./pages/EventLog";
import DeviceHealth from "./pages/DeviceHealth";
import NetworkMQTT from "./pages/NetworkMQTT";
import { useTelemetry } from "./hooks/useTelemetry";

const PAGE_META = {
  overview: ["Environmental Overview", "Real-time hazard detection & distributed sensor intelligence"],
  sensors: ["Live Sensor Data", "Live environmental measurements from the field node"],
  hazards: ["Hazard Intelligence", "Localized environmental risk classification"],
  events: ["Event Log", "Recorded hazard events and sensor activity"],
  device: ["Device Health", "ESP32-S3 node health, battery and runtime state"],
  network: ["Network / MQTT", "Gateway, transport and real-time connection status"]
};

export default function App() {
  const [section, setSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const telemetry = useTelemetry();

  const renderPage = () => {
    const props = { telemetry };
    switch (section) {
      case "sensors": return <LiveSensors {...props} />;
      case "hazards": return <HazardIntelligence {...props} />;
      case "events": return <EventLog {...props} />;
      case "device": return <DeviceHealth {...props} />;
      case "network": return <NetworkMQTT {...props} />;
      default: return <Overview {...props} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        active={section}
        open={sidebarOpen}
        connected={telemetry.connected}
        onNavigate={(next) => {
          setSection(next);
          setSidebarOpen(false);
        }}
      />
      <main className="main">
        <Topbar
          meta={PAGE_META[section]}
          connected={telemetry.connected}
          onMenu={() => setSidebarOpen(v => !v)}
        />
        <div className="content">{renderPage()}</div>
      </main>
    </div>
  );
}
