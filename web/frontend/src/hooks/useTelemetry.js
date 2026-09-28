import { useCallback, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { getLatest } from "../api/dashboard.api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
const DEMO = import.meta.env.VITE_DEMO_MODE === "true";

const initial = {
  water: 0, temp: 0, gas: 0, pressure: 0,
  accelX: 0, accelY: 0, accelZ: 9.81,
  battery: 0, batteryVolts: 0, hazard: "NORMAL",
  packets: 0, connected: false, lastUpdate: null,
  history: { water: [], temp: [], gas: [] }, events: []
};

function normalize(record = {}) {
  const prediction = record.prediction || {};
  return {
    water: Number(record.waterLevel ?? record.water_level_pct ?? record.water_level ?? 0),
    temp: Number(record.temperature ?? record.temperature_c ?? 0),
    gas: Number(record.gasVoltage ?? record.gas_voltage ?? record.mq2 ?? 0),
    pressure: Number(record.pressure ?? record.pressure_hpa ?? 0),
    accelX: Number(record.accelX ?? record.accel_x ?? 0),
    accelY: Number(record.accelY ?? record.accel_y ?? 0),
    accelZ: Number(record.accelZ ?? record.accel_z ?? 9.81),
    battery: Number(record.battery ?? record.battery_pct ?? 0),
    batteryVolts: Number(record.batteryVoltage ?? record.battery_volts ?? 0),
    hazard: String(prediction.hazard ?? record.hazard ?? "NORMAL").toUpperCase(),
    receivedAt: record.timestamp || record.receivedAt || new Date().toISOString()
  };
}

export function useTelemetry() {
  const [state, setState] = useState(initial);

  const ingest = useCallback((raw) => {
    const d = normalize(raw);
    setState(prev => {
      const events = [...prev.events];
      if (d.hazard !== "NORMAL" && d.hazard !== prev.hazard) {
        events.unshift({
          id: `${Date.now()}-${Math.random()}`,
          time: new Date(d.receivedAt).toLocaleTimeString(),
          type: d.hazard, water: d.water, temp: d.temp, gas: d.gas,
          accel: Math.sqrt(d.accelX ** 2 + d.accelY ** 2 + d.accelZ ** 2)
        });
      }
      return {
        ...prev, ...d,
        packets: prev.packets + 1,
        lastUpdate: new Date(d.receivedAt).toLocaleTimeString(),
        history: {
          water: [...prev.history.water, d.water].slice(-60),
          temp: [...prev.history.temp, d.temp].slice(-60),
          gas: [...prev.history.gas, d.gas].slice(-60)
        },
        events: events.slice(0, 50)
      };
    });
  }, []);

  useEffect(() => {
    let socket;

    const loadSnapshot = async () => {
      try {
        const data = await getLatest();
        if (data?.telemetry) ingest(data.telemetry);
        else if (data?.latest) ingest(data.latest);
      } catch (error) { console.error(error); }
    };

    loadSnapshot();

    if (!DEMO) {
      socket = io(SOCKET_URL, { transports: ["websocket"] });
      socket.on("connect", () => setState(s => ({ ...s, connected: true })));
      socket.on("disconnect", () => setState(s => ({ ...s, connected: false })));
      socket.on("telemetry:new", (payload) => ingest(payload?.telemetry || payload));
      socket.on("alert:new", alert => {
        if (alert?.hazard) ingest({ ...alert, prediction: { hazard: alert.hazard } });
      });
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState(s => ({ ...s, connected: false }));
      const timer = setInterval(() => {
        const t = Date.now() / 10000;
        ingest({
          temperature_c: 29 + Math.sin(t) * 3,
          humidity_pct: 62 + Math.sin(t / 2) * 7,
          water_level_pct: 20 + Math.max(0, Math.sin(t / 3)) * 15,
          gas_voltage: 0.28 + Math.max(0, Math.sin(t / 4)) * 0.15,
          pressure_hpa: 1007 + Math.sin(t / 5) * 2,
          accel_x: Math.sin(t) * 0.08,
          accel_y: Math.cos(t) * 0.06,
          accel_z: 9.81,
          battery_pct: 87,
          battery_volts: 3.91
        });
      }, 1800);
      return () => clearInterval(timer);
    }

    return () => {
      socket?.disconnect();
    };
  }, [ingest]);

  const derived = useMemo(() => ({
    maxAccel: Math.sqrt(state.accelX ** 2 + state.accelY ** 2 + state.accelZ ** 2),
    waterState: state.water >= 70 ? "High" : state.water >= 45 ? "Elevated" : "Normal",
    tempState: state.temp >= 45 ? "High" : "Normal",
    gasState: state.gas >= 1.5 ? "High" : state.gas >= 0.8 ? "Elevated" : "Normal",
    motionState: Math.abs(state.maxAccel - 9.81) > 0.8 ? "Motion detected" : "Stable"
  }), [state]);

  return { ...state, ...derived, apiUrl: API_URL };
}
