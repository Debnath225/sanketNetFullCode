import { Droplets, Gauge, GaugeCircle, BatteryMedium, Activity, Database, Radio } from "lucide-react";
import StatusBanner from "../components/dashboard/StatusBanner";
import MetricCard from "../components/common/MetricCard";
import Card from "../components/common/Card";
import SensorChart from "../components/dashboard/SensorChart";

export default function Overview({ telemetry: t }) {
  return (
    <section className="section active">
      <StatusBanner hazard={t.hazard} lastUpdate={t.lastUpdate} />

      <div className="grid">
        <MetricCard title="Water Level" value={t.water.toFixed(1)} unit="%" icon={<Droplets size={16}/>}
          progress={t.water} footerLeft="Flood indicator" footerRight={t.waterState} />
        <MetricCard title="Temperature" value={t.temp.toFixed(1)} unit="°C" icon={<GaugeCircle size={16}/>}
          footerLeft="Atmospheric" footerRight={t.tempState} />
        <MetricCard title="Gas / Smoke" value={t.gas.toFixed(2)} unit="V" icon={<Activity size={16}/>}
          progress={Math.min(100, t.gas / 3.3 * 100)} footerLeft="MQ-2 analog" footerRight={t.gasState} />
        <MetricCard title="Pressure" value={t.pressure.toFixed(1)} unit="hPa" icon={<Gauge size={16}/>}
          footerLeft="BMP180" footerRight="Atmospheric" />
        <MetricCard title="Max Acceleration" value={t.maxAccel.toFixed(2)} unit="m/s²" icon={<Activity size={16}/>}
          footerLeft="MPU6050" footerRight={t.motionState} />
        <MetricCard title="Battery" value={t.battery.toFixed(0)} unit="%" icon={<BatteryMedium size={16}/>}
          progress={t.battery} footerLeft={`${t.batteryVolts.toFixed(2)} V`} footerRight="Power" />
        <MetricCard title="Data Packets" value={t.packets} icon={<Database size={16}/>}
          footerLeft="Backend / MQTT" footerRight="Live" />
        <MetricCard title="Device Status" value={t.lastUpdate ? "ONLINE" : "OFFLINE"} icon={<Radio size={16}/>}
          footerLeft="ESP32-S3" footerRight={t.lastUpdate ? "Receiving" : "Waiting"} />
      </div>

      <div className="two-col">
        <Card>
          <div className="card-heading"><h3>Sensor Activity</h3><span>Last 60 readings</span></div>
          <div className="chart"><SensorChart history={t.history} /></div>
        </Card>
        <Card>
          <div className="card-heading"><h3>Hazard Summary</h3><span>Real-time</span></div>
          {[
            ["Current condition", t.hazard],
            ["Water level", `${t.water.toFixed(1)} %`],
            ["Temperature", `${t.temp.toFixed(1)} °C`],
            ["Gas / smoke", `${t.gas.toFixed(2)} V`],
            ["Device", t.lastUpdate ? "ONLINE" : "OFFLINE"]
          ].map(([a,b]) => <div className="info-row" key={a}><span className="info-label">{a}</span><span className="info-value">{b}</span></div>)}
        </Card>
      </div>

      <div className="footer"><span>SANKAT-NET · Environmental Intelligence</span><span>Distributed sensor monitoring</span></div>
    </section>
  );
}
