import './App.css'

function App() {
  const metrics = [
    { title: 'VM CPU Usage', value: '32%', status: 'Healthy' },
    { title: 'Storage Usage', value: '68%', status: 'Warning' },
    { title: 'Active Alerts', value: '1', status: 'Attention' },
  ]

  const resources = [
    { name: 'vm-demo-01', type: 'Virtual Machine', status: 'Running', region: 'UK South' },
    { name: 'stmonitor001', type: 'Storage Account', status: 'Healthy', region: 'UK South' },
    { name: 'func-monitor-api', type: 'Function App', status: 'Healthy', region: 'UK South' },
  ]

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>Azure Resource Monitoring Dashboard</h1>
          <p className="subtitle">Mock monitoring data for portfolio build</p>
        </div>
        <div className="last-updated">Last updated: just now</div>
      </header>

      <section className="cards">
        {metrics.map((metric) => (
          <div className="card" key={metric.title}>
            <div className="card-label">{metric.title}</div>
            <div className="card-value">{metric.value}</div>
            <div className="card-status">{metric.status}</div>
          </div>
        ))}
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Monitored Resources</h2>
        </div>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Region</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((resource) => (
              <tr key={resource.name}>
                <td>{resource.name}</td>
                <td>{resource.type}</td>
                <td>{resource.status}</td>
                <td>{resource.region}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel alerts-panel">
        <div className="panel-header">
          <h2>Alerts</h2>
        </div>
        <div className="alert warning">
          Storage usage exceeded 65% on stmonitor001
        </div>
      </section>
    </div>
  )
}

export default App
