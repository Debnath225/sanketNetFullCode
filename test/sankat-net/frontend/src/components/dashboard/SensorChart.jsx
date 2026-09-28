import { useEffect, useRef } from "react";

export default function SensorChart({ history }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = rect.width, h = rect.height;
    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(255,255,255,.06)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = 15 + i * ((h - 30) / 4);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    const line = (values, max, color) => {
      if (values.length < 2) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      values.forEach((v, i) => {
        const x = (i / Math.max(1, values.length - 1)) * w;
        const y = h - 20 - Math.min(1, Math.max(0, v / max)) * (h - 40);
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      });
      ctx.stroke();
    };

    line(history.water, 100, "#22d3ee");
    line(history.temp, 100, "#f59e0b");
    line(history.gas, 3.3, "#a78bfa");

    ctx.font = "10px Segoe UI";
    ctx.fillStyle = "#22d3ee"; ctx.fillText("Water", 12, 18);
    ctx.fillStyle = "#f59e0b"; ctx.fillText("Temperature", 70, 18);
    ctx.fillStyle = "#a78bfa"; ctx.fillText("Gas", 160, 18);
  }, [history]);

  return <canvas ref={ref} className="chart-canvas" />;
}
