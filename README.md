# azure-resource-monitor-dashboard
azure-resource-monitor-dashboard project
# Azure Resource Monitor Dashboard

A full-stack cloud monitoring dashboard built on Azure, displaying live VM CPU metrics, storage capacity, and automated alerting — all visualised in a real-time React frontend.

## Live Demo
🔗 [View Dashboard](https://purple-hill-079932503.7.azurestaticapps.net)

## Architecture

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Recharts |
| API | Azure Functions v4 (Node.js) |
| Metrics | Azure Monitor + Log Analytics (KQL) |
| Storage | Azure Table Storage |
| Auth | Managed Identity (passwordless) |
| Hosting | Azure Static Web Apps |
| CI/CD | GitHub Actions |
| IaC | Azure Portal + Azure CLI |

## Features

- **Live CPU Monitoring** — queries Log Analytics every 30 seconds using KQL
- **Storage Tracking** — monitors Azure Storage account capacity via Azure Monitor Metrics API
- **Automated Alerts** — triggers and persists alerts to Table Storage when CPU exceeds 80%
- **Real-time Chart** — visualises CPU usage over the last hour
- **Futuristic UI** — dark navy/cyan dashboard with glowing metric cards

## Azure Services Used

- Azure Monitor
- Log Analytics Workspace
- Azure Functions (Flex Consumption)
- Azure Static Web Apps
- Azure Table Storage
- Azure Managed Identity
- Azure Virtual Machine (Ubuntu 24.04)
- Data Collection Rules (DCR)
- Network Security Groups

## Local Development

### Prerequisites
- Node.js 20
- Azure Functions Core Tools v4
- Azure CLI

### Setup

```bash
# Clone the repo
git clone https://github.com/latech23/azure-resource-monitor-dashboard.git
cd azure-resource-monitor-dashboard

# Install API dependencies
cd api && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Running Locally

```bash
# Terminal 1 — start the API
cd api
func start

# Terminal 2 — start the frontend
cd frontend
npm run dev
```

Visit `http://localhost:5173`

### Environment Variables

Create `api/local.settings.json`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "YOUR_STORAGE_CONNECTION_STRING",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "STORAGE_CONNECTION_STRING": "YOUR_STORAGE_CONNECTION_STRING",
    "LOG_ANALYTICS_WORKSPACE_ID": "YOUR_WORKSPACE_ID"
  }
}
```

## Project Status
✅ Complete — built as part of AZ-104 certification study to reinforce Azure Monitor, Log Analytics, and cloud architecture concepts.
