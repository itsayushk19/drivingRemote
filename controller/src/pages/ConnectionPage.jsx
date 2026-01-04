import { useRef, useState, useEffect } from "react";
import { useApp } from "../state/appState";

function computeStats(values) {
  if (!values.length) return null;

  const avg =
    values.reduce((a, b) => a + b, 0) / values.length;

  const variance =
    values.reduce((a, b) => a + (b - avg) ** 2, 0) /
    values.length;

  return {
    avg: Math.round(avg),
    min: Math.min(...values),
    max: Math.max(...values),
    jitter: Math.round(Math.sqrt(variance))
  };
}

function Stat({ label, value }) {
  return (
    <div style={stat}>
      <div style={statLabel}>{label}</div>
      <div style={statValue}>{value}</div>
    </div>
  );
}

function LatencyGraph({ values }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || values.length < 2) return;

    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const N = values.length;

    /* ---------- Build series ---------- */
    let sum = 0;
    let minSoFar = values[0];
    let maxSoFar = values[0];

    const avg = [];
    const min = [];
    const max = [];

    for (let i = 0; i < N; i++) {
      const v = values[i];
      sum += v;
      minSoFar = Math.min(minSoFar, v);
      maxSoFar = Math.max(maxSoFar, v);

      avg.push(sum / (i + 1));
      min.push(minSoFar);
      max.push(maxSoFar);
    }

    /* ---------- Scale ---------- */
    const all = [...values, ...avg, ...min, ...max];
    const vMin = Math.min(...all, 0);
    const vMax = Math.max(...all, 50);

    const map = (v, i) => ({
      x: (i / (N - 1)) * w,
      y: h - ((v - vMin) / (vMax - vMin)) * h
    });

    /* ---------- Draw ---------- */
    drawSeries(ctx, values, map, "#22c55e"); // Live
    drawSeries(ctx, avg, map, "#06b6d4");    // Avg
    drawSeries(ctx, min, map, "#f59e0b");    // Min
    drawSeries(ctx, max, map, "#ef4444");    // Max
  }, [values.length]); // 🔑 IMPORTANT FIX

  return (
    <canvas
      ref={canvasRef}
      width={440}
      height={130}
      style={graph}
    />
  );
}


function drawSeries(ctx, data, map, color) {
  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;

  ctx.beginPath();
  data.forEach((v, i) => {
    const { x, y } = map(v, i);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Leading head
  const { x, y } = map(data[data.length - 1], data.length - 1);
  ctx.shadowBlur = 0;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}




export default function ConnectionPage() {
  const {
    connected,
    latency,
    controlPayload,
    serverUrl,
    setServerUrl,
    connect,
    disconnect
  } = useApp();

  const history = useRef([]);
  const [input, setInput] = useState(serverUrl);

  if (latency != null) {
    history.current.push(latency);
    if (history.current.length > 30) history.current.shift();
  }

  const avgLatency =
    history.current.length > 0
      ? Math.round(
          history.current.reduce((a, b) => a + b, 0) /
            history.current.length
        )
      : null;

  const latencyState =
    latency == null
      ? "idle"
      : latency < 20
      ? "good"
      : latency < 50
      ? "warn"
      : "bad";

  return (
    <div style={page}>
      <div style={container}>
        {/* HEADER */}
        <header style={header}>
          <div style={title}>Connection Status</div>
          <div style={subtitle}>
            Network diagnostics & live control stream
          </div>
        </header>

        {/* CONNECTION CONTROL CARD */}
        <div style={{ ...card, ...connectCard }}>
          <div style={fieldLabel}>Server Address</div>

          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="ws://192.168.1.10:8000/ws"
            style={inputStyle}
          />

          <div style={buttonRow}>
            <button
  style={{
    ...btnPrimary,
    opacity: connected ? 0.6 : 1
  }}
  disabled={connected}
  onClick={() => {
    setServerUrl(input);
    connect();
  }}
>
  Connect
</button>

<button
  style={{
    ...btnSecondary,
    opacity: connected ? 1 : 0.6
  }}
  disabled={!connected}
  onClick={disconnect}
>
  Disconnect
</button>

          </div>
        </div>

        {/* STATUS CARD */}
        <div
          style={{
            ...card,
            ...statusCard,
            ...(connected ? statusConnected : statusDisconnected)
          }}
        >
          <div style={statusIcon}>
            {connected ? "🟢" : "🔴"}
          </div>

          <div>
            <div style={statusTitle}>
              {connected
                ? "Controller Connected"
                : "Controller Disconnected"}
            </div>
            <div style={statusDesc}>
              {connected
                ? "Live control data is streaming normally."
                : "Waiting for controller to connect."}
            </div>
          </div>
        </div>

        {/* LATENCY CARD */}
{latency != null && (() => {
  const stats = computeStats(history.current);

  return (
    <div
      style={{
        ...card,
        ...latencyCard,
        ...(latencyState === "good"
          ? latencyGood
          : latencyState === "warn"
          ? latencyWarn
          : latencyBad)
      }}
    >
      <div style={latencyHeader}>Network Latency</div>

      {/* LIVE VALUE */}
      <div style={latencyValue}>
        {latency}
        <span style={latencyUnit}>ms</span>
      </div>

      {/* STATS ROW */}
      {stats && (
        <div style={latencyStats}>
          <Stat label="AVG" value={`${stats.avg} ms`} />
          <Stat label="MIN" value={`${stats.min} ms`} />
          <Stat label="MAX" value={`${stats.max} ms`} />
          <Stat label="JITTER" value={`${stats.jitter} ms`} />
        </div>
      )}

      {/* GRAPH */}
      <LatencyGraph values={history.current} />
<div style={legend}>
  <LegendDot color="#22c55e" label="Live" />
  <LegendDot color="#06b6d4" label="Avg" />
  <LegendDot color="#f59e0b" label="Min" />
  <LegendDot color="#ef4444" label="Max" />
</div>

    </div>
  );
})()}


        {/* PAYLOAD INSPECTOR */}
        <div style={{ ...card, ...consoleCard }}>
          <div style={consoleHeader}>
            Live Control Payload
          </div>

          <pre style={consoleBody}>
            {controlPayload
              ? JSON.stringify(controlPayload, null, 2)
              : "Waiting for control input…"}
          </pre>
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div style={legendItem}>
      <span style={{ ...legendDot, background: color }} />
      {label}
    </div>
  );
}



/* ====================== STYLES ====================== */

const page = {
  height: "calc(100vh - 64px)",
  overflow: "hidden",
  padding: "24px 16px",
  background: "radial-gradient(circle at top,#020617,#000)"
};

const container = {
  maxWidth: 520,
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: 18
};

const header = {
  marginBottom: 8
};

const title = {
  fontSize: 22,
  fontWeight: 800,
  letterSpacing: 0.3
};

const subtitle = {
  marginTop: 4,
  fontSize: 13,
  opacity: 0.6
};

/* ---------- Cards ---------- */

const card = {
  borderRadius: 18,
  padding: 18,
  border: "1px solid rgba(255,255,255,.08)",
  backdropFilter: "blur(12px)"
};

/* ---------- Connect ---------- */

const connectCard = {
  background: "rgba(2,6,23,.7)"
};

const fieldLabel = {
  fontSize: 12,
  opacity: 0.65,
  marginBottom: 6
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  background: "#020617",
  border: "1px solid rgba(255,255,255,.15)",
  color: "#e5e7eb",
  fontFamily: "inherit",
  marginBottom: 12
};

const buttonRow = {
  display: "flex",
  gap: 10
};

const btnPrimary = {
  flex: 1,
  padding: "10px",
  borderRadius: 10,
  background: "#2563eb",
  color: "#fff",
  fontWeight: 700
};

const btnSecondary = {
  flex: 1,
  padding: "10px",
  borderRadius: 10,
  background: "#020617",
  color: "#9ca3af",
  border: "1px solid rgba(255,255,255,.1)"
};

/* ---------- Status ---------- */

const statusCard = {
  display: "flex",
  alignItems: "center",
  gap: 14
};

const statusConnected = {
  background:
    "linear-gradient(180deg,rgba(34,197,94,.25),rgba(34,197,94,.05))"
};

const statusDisconnected = {
  background:
    "linear-gradient(180deg,rgba(239,68,68,.25),rgba(239,68,68,.05))"
};

const statusIcon = {
  fontSize: 26
};

const statusTitle = {
  fontSize: 16,
  fontWeight: 700
};

const statusDesc = {
  fontSize: 12,
  opacity: 0.7,
  marginTop: 2
};

/* ---------- Latency ---------- */

const latencyCard = {
  position: "relative"
};

const latencyGood = {
  background:
    "linear-gradient(180deg,rgba(34,197,94,.22),rgba(34,197,94,.04))"
};

const latencyWarn = {
  background:
    "linear-gradient(180deg,rgba(245,158,11,.22),rgba(245,158,11,.04))"
};

const latencyBad = {
  background:
    "linear-gradient(180deg,rgba(239,68,68,.22),rgba(239,68,68,.04))"
};

const latencyHeader = {
  fontSize: 12,
  opacity: 0.65
};

const latencyValue = {
  marginTop: 6,
  fontSize: 32,
  fontWeight: 900,
  letterSpacing: 0.5
};

const latencyUnit = {
  fontSize: 14,
  opacity: 0.6,
  marginLeft: 4
};

const latencyAvg = {
  marginTop: 4,
  fontSize: 12,
  opacity: 0.6
};

/* ---------- Console ---------- */

const consoleCard = {
  background: "#020617",
  padding: 14
};

const consoleHeader = {
  fontSize: 12,
  opacity: 0.6,
  marginBottom: 10,
  letterSpacing: 0.5
};

const consoleBody = {
  fontFamily: "JetBrains Mono, monospace",
  fontSize: 12,
  color: "#22c55e",
  maxHeight: 260,
  overflow: "auto",
  margin: 0,
  whiteSpace: "pre-wrap"
};

const latencyStats = {
  display: "flex",
  gap: 16,
  marginTop: 10,
  marginBottom: 8
};

const stat = {
  display: "flex",
  flexDirection: "column",
  gap: 2
};

const statLabel = {
  fontSize: 10,
  opacity: 0.6,
  letterSpacing: 0.6
};

const statValue = {
  fontSize: 13,
  fontWeight: 700
};

const graph = {
  marginTop: 10,
  width: "100%",
  borderRadius: 12,
  background: "rgba(0,0,0,.35)"
};

const legend = {
  display: "flex",
  gap: 14,
  marginTop: 6,
  fontSize: 11,
  opacity: 0.75
};

const legendItem = {
  display: "flex",
  alignItems: "center",
  gap: 6
};

const legendDot = {
  width: 8,
  height: 8,
  borderRadius: "50%"
};
