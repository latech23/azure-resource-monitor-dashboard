import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

const styles = {
  page: {
    background: "linear-gradient(135deg, #0a0e1a 0%, #0d1b2a 100%)",
    minHeight: "100vh",
    padding: "32px",
    fontFamily: "'Courier New', Courier, monospace",
    color: "#c0c8d8",
  },
  header: {
    marginBottom: "8px",
    fontSize: "36px",
    fontWeight: "bold",
    letterSpacing: "6px",
    textTransform: "uppercase",
    background: "linear-gradient(90deg, #00d4ff, #7b9fff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    color: "#4a6fa5",
    marginBottom: "36px",
    letterSpacing: "3px",
    fontSize: "12px",
    textTransform: "uppercase",
  },
  cardsRow: {
    display: "flex",
    gap: "20px",
    marginBottom: "28px",
    flexWrap: "wrap",
  },
  card: {
    background: "linear-gradient(145deg, #0d1b2a, #0a1628)",
    border: "2px solid #00d4ff",
    borderRadius: "12px",
    padding: "28px 32px",
    flex: 1,
    minWidth: "200px",
    boxShadow: "0 0 20px rgba(0, 212, 255, 0.15), inset 0 0 20px rgba(0, 212, 255, 0.03)",
    position: "relative",
    overflow: "hidden",
  },
  cardTitle: {
    color: "#4a6fa5",
    margin: "0 0 12px 0",
    fontSize: "11px",
    letterSpacing: "3px",
    textTransform: "uppercase",
  },
  cardValue: {
    margin: "0 0 8px 0",
    fontSize: "42px",
    fontWeight: "bold",
    letterSpacing: "2px",
  },
  cardStatus: {
    fontSize: "10px",
    letterSpacing: "2px",
    textTransform: "uppercase",
  },
  chartBox: {
    background: "linear-gradient(145deg, #0d1b2a, #0a1628)",
    border: "2px solid #1a3a5c",
    borderRadius: "12px",
    padding: "28px",
    marginBottom: "28px",
    boxShadow: "0 0 20px rgba(0, 212, 255, 0.08)",
  },
  chartTitle: {
    marginTop: 0,
    marginBottom: "20px",
    fontSize: "12px",
    letterSpacing: "3px",
    textTransform: "uppercase",
    color: "#00d4ff",
  },
  alertsBox: {
    background: "linear-gradient(145deg, #0d1b2a, #0a1628)",
    border: "2px solid #1a3a5c",
    borderRadius: "12px",
    padding: "28px",
    boxShadow: "0 0 20px rgba(0, 212, 255, 0.08)",
  },
  alertItem: {
    background: "rgba(0, 212, 255, 0.05)",
    border: "1px solid #1a3a5c",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "10px",
  }
};

function MetricCard({ title, value, unit, status }) {
  const statusColor = status === "ok" ? "#00d4ff" : status === "warning" ? "#f59e0b" : "#ef4444";
  const glowColor = status === "ok" ? "rgba(0, 212, 255, 0.4)" : status === "warning" ? "rgba(245, 158, 11, 0.4)" : "rgba(239, 68, 68, 0.4)";
  return (
    <div style={{ ...styles.card, borderColor: statusColor, boxShadow: `0 0 24px ${glowColor}, inset 0 0 20px rgba(0,0,0,0.2)` }}>
      <p style={styles.cardTitle}>{title}</p>
      <h2 style={{ ...styles.cardValue, color: statusColor, textShadow: `0 0 20px ${glowColor}` }}>
        {value}<span style={{ fontSize: "18px", marginLeft: "6px", opacity: 0.7 }}>{unit}</span>
      </h2>
      <p style={{ ...styles.cardStatus, color: statusColor }}>● {status}</p>
    </div>
  );
}

export default function App() {
  const [metrics, setMetrics] = useState([]);
  const [storage, setStorage] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [metricsRes, storageRes, alertsRes] = await Promise.all([
          fetch(`${API_BASE}/getMetrics`),
          fetch(`${API_BASE}/getStorageMetrics`),
          fetch(`${API_BASE}/getAlerts`)
        ]);

        const metricsData = await metricsRes.json();
        const storageData = await storageRes.json();
        const alertsData = await alertsRes.json();

        setMetrics(metricsData.metrics || []);
        setStorage(storageData.storage || []);
        setAlerts(alertsData.alerts || []);

        const latest = metricsData.metrics?.[metricsData.metrics.length - 1];
        if (latest && latest.avgCPU > 80) {
          await fetch(`${API_BASE}/getAlerts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              resourceName: "vm-monitor-test",
              severity: "high",
              message: `CPU usage is ${latest.avgCPU.toFixed(1)}% — above 80% threshold`
            })
          });
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const latestCPU = metrics.length > 0 ? metrics[metrics.length - 1].avgCPU?.toFixed(1) : "—";
  const latestStorage = storage.length > 0 && storage[storage.length - 1].usedCapacity != null
    ? (storage[storage.length - 1].usedCapacity / 1024 / 1024).toFixed(2) : "0.00";
  const cpuStatus = latestCPU > 80 ? "critical" : latestCPU > 60 ? "warning" : "ok";

  if (loading) return <div style={{ ...styles.page, display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ color: "#00d4ff", letterSpacing: "4px", fontSize: "14px" }}>INITIALISING SYSTEMS...</p></div>;
  if (error) return <div style={{ ...styles.page }}><p style={{ color: "#ef4444", letterSpacing: "3px" }}>SYSTEM ERROR: {error}</p></div>;

  return (
    <div style={styles.page}>
      <h1 style={styles.header}>Azure Resource Monitor</h1>
      <p style={styles.subtitle}>// live telemetry feed — {new Date().toUTCString()}</p>

      <div style={styles.cardsRow}>
        <MetricCard title="CPU Usage" value={latestCPU} unit="%" status={cpuStatus} />
        <MetricCard title="Storage Capacity" value={latestStorage} unit="MB" status="ok" />
        <MetricCard title="Active Alerts" value={alerts.length} unit="" status={alerts.length > 0 ? "warning" : "ok"} />
      </div>

      <div style={styles.chartBox}>
        <h3 style={styles.chartTitle}>// CPU Telemetry — Last 60 Minutes</h3>
        {metrics.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a3a5c" />
              <XAxis dataKey="time" tick={{ fill: "#4a6fa5", fontSize: 11, fontFamily: "Courier New" }} tickFormatter={(t) => new Date(t).toLocaleTimeString()} />
              <YAxis tick={{ fill: "#4a6fa5", fontFamily: "Courier New" }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: "#0d1b2a", border: "1px solid #00d4ff", borderRadius: "8px", fontFamily: "Courier New", color: "#c0c8d8" }}
                formatter={(v) => [`${v?.toFixed(1)}%`, "CPU"]}
                labelFormatter={(t) => new Date(t).toLocaleTimeString()}
              />
              <Line type="monotone" dataKey="avgCPU" stroke="#00d4ff" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ color: "#4a6fa5", letterSpacing: "2px", fontSize: "12px" }}>// awaiting telemetry data...</p>
        )}
      </div>

      <div style={styles.alertsBox}>
        <h3 style={styles.chartTitle}>// Alert Log</h3>
        {alerts.length === 0 ? (
          <p style={{ color: "#4a6fa5", letterSpacing: "2px", fontSize: "12px" }}>// no active alerts detected</p>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} style={styles.alertItem}>
              <strong style={{ color: alert.severity === "high" ? "#ef4444" : "#f59e0b", letterSpacing: "2px", fontSize: "11px" }}>
                ▲ {alert.severity?.toUpperCase()}
              </strong>
              <span style={{ marginLeft: "12px", color: "#c0c8d8" }}>{alert.resourceName} — {alert.message}</span>
              <span style={{ float: "right", color: "#4a6fa5", fontSize: "11px", fontFamily: "Courier New" }}>{new Date(alert.timestamp).toLocaleString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}