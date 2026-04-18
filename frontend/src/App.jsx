import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

function MetricCard({ title, value, unit, status }) {
  const statusColor = status === "ok" ? "#22c55e" : status === "warning" ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ background: "#1e1e2e", borderRadius: 12, padding: 24, minWidth: 200, flex: 1 }}>
      <p style={{ color: "#888", margin: 0, fontSize: 14 }}>{title}</p>
      <h2 style={{ color: statusColor, margin: "8px 0", fontSize: 32 }}>{value}<span style={{ fontSize: 16, marginLeft: 4 }}>{unit}</span></h2>
      <p style={{ color: statusColor, margin: 0, fontSize: 12, textTransform: "uppercase" }}>{status}</p>
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
        // Alert logic — trigger if CPU > 80%

 const latest = metricsData.metrics?.[metricsData.metrics.length - 1];
        if (latest && latest.avgCPU > 80) {
          await fetch(`/api/getAlerts`, {
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
  const latestStorage = storage.length > 0 && storage[storage.length - 1].usedCapacity != null ? (storage[storage.length - 1].usedCapacity / 1024 / 1024).toFixed(2) : "0.00";
  const cpuStatus = latestCPU > 80 ? "critical" : latestCPU > 60 ? "warning" : "ok";

  if (loading) return <div style={{ color: "#fff", padding: 40, background: "#13131f", minHeight: "100vh" }}>Loading dashboard...</div>;
  if (error) return <div style={{ color: "#ef4444", padding: 40, background: "#13131f", minHeight: "100vh" }}>Error: {error}</div>;

  return (
    <div style={{ background: "#13131f", minHeight: "100vh", padding: 32, fontFamily: "sans-serif", color: "#fff" }}>
      <h1 style={{ marginBottom: 8 }}>Azure Resource Monitor</h1>
      <p style={{ color: "#888", marginBottom: 32 }}>Live metrics from your Azure resources</p>

      <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
        <MetricCard title="CPU Usage" value={latestCPU} unit="%" status={cpuStatus} />
        <MetricCard title="Storage Used" value={latestStorage} unit="MB" status="ok" />
        <MetricCard title="Active Alerts" value={alerts.length} unit="" status={alerts.length > 0 ? "warning" : "ok"} />
      </div>

      <div style={{ background: "#1e1e2e", borderRadius: 12, padding: 24, marginBottom: 32 }}>
        <h3 style={{ marginTop: 0 }}>CPU Usage — Last Hour</h3>
        {metrics.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="time" tick={{ fill: "#888", fontSize: 11 }} tickFormatter={(t) => new Date(t).toLocaleTimeString()} />
              <YAxis tick={{ fill: "#888" }} domain={[0, 100]} />
              <Tooltip formatter={(v) => `${v?.toFixed(1)}%`} labelFormatter={(t) => new Date(t).toLocaleTimeString()} />
              <Line type="monotone" dataKey="avgCPU" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ color: "#888" }}>No CPU data yet — metrics may take a few minutes to appear after connecting the VM.</p>
        )}
      </div>

      <div style={{ background: "#1e1e2e", borderRadius: 12, padding: 24 }}>
        <h3 style={{ marginTop: 0 }}>Alerts</h3>
        {alerts.length === 0 ? (
          <p style={{ color: "#888" }}>No active alerts</p>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} style={{ background: "#2a2a3e", borderRadius: 8, padding: 16, marginBottom: 8 }}>
              <strong style={{ color: alert.severity === "high" ? "#ef4444" : "#f59e0b" }}>{alert.severity?.toUpperCase()}</strong>
              <span style={{ marginLeft: 12 }}>{alert.resourceName} — {alert.message}</span>
              <span style={{ float: "right", color: "#888", fontSize: 12 }}>{new Date(alert.timestamp).toLocaleString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}