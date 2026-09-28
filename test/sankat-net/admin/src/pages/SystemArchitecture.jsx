const blocks=[
  ["Field Node","BME280","Temp / RH / Pressure"],["Field Node","MQ-2","Smoke / Gas"],["Field Node","MQ-135","Air Quality"],["Field Node","Flame","Fire"],["Field Node","Water / Soil","Flood / Soil"],["Field Node","MPU6050","Vibration"],["Edge","ESP32-S3","Local processing"],["Network","LoRa Mesh","Store & forward"],["Gateway","GW-FFFF","MQTT / TLS"],["Backend","Node.js","API + AI + DB"],["Clients","React","Dashboard + Admin"]
];
export default function SystemArchitecture(){
 return <section><div className="section-title"><h2>System Architecture</h2><p>Sankat-Net end-to-end resilient environmental monitoring stack.</p></div>
 <div className="architecture-grid">{blocks.map(([g,n,d],i)=><div className="card arch-card" key={i}><span>{g}</span><h3>{n}</h3><p>{d}</p></div>)}</div>
 <div className="card arch-flow"><div className="pipeline-flow">{["Field sensing","ESP32 edge","LoRa mesh","Gateway","MQTT/TLS","Node.js backend","MongoDB + AI","React clients"].map((x,i)=><span className="pipeline-item" key={x}>{i>0&&<b>›</b>}<em>{x}</em></span>)}</div></div>
 </section>
}