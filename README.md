# Azure Resource Monitor Dashboard

A full-stack cloud monitoring dashboard built on Azure. It pulls live VM CPU metrics and storage data through Log Analytics and Azure Monitor, fires off automated alerts when thresholds are hit, and displays everything in a real-time React frontend.

> **Note:** Azure resources have been deprovisioned to keep costs down. Screenshots below show the dashboard running.

---

## Why I built this

I was studying for AZ-104 and wanted to actually build something rather than just read about the services. So I put together a project that tied together a few of the core Azure concepts (monitoring, serverless functions, storage, and auth) into something that works end to end.

A few decisions I made along the way: I used Managed Identity instead of connection strings so there are no secrets sitting in the code, went with Azure Functions on Flex Consumption to avoid paying for idle time, and used KQL to query Log Analytics directly because it gave me more control over how the data was shaped before hitting the frontend.

---

## Screenshots

><img width="2048" height="1259" alt="1776544544245" src="https://github.com/user-attachments/assets/575ab099-8802-4836-aab3-b1324a21d07b" />
<img width="2048" height="1273" alt="1776544544370" src="https://github.com/user-attachments/assets/15f8405a-a534-4e67-91ed-563c0ce2b704" />
<img width="2048" height="964" alt="1776544544333" src="https://github.com/user-attachments/assets/2ca125a5-394d-4ec2-bb61-3f483364568b" />


---

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

---

## Features

- **Live CPU monitoring** — queries Log Analytics every 30 seconds via KQL, shown as a rolling chart
- **Storage tracking** — monitors Azure Storage capacity using the Azure Monitor Metrics API
- **Automated alerts** — when CPU goes over 80%, an alert is triggered and saved to Table Storage
- **Passwordless auth** — Managed Identity handles all service communication, no credentials in code
- **CI/CD pipeline** — GitHub Actions deploys to Azure Static Web Apps automatically on every push to main

---

## Azure services used

- Azure Monitor
- Log Analytics Workspace
- Azure Functions (Flex Consumption)
- Azure Static Web Apps
- Azure Table Storage
- Azure Managed Identity
- Azure Virtual Machine (Ubuntu 24.04)
- Data Collection Rules (DCR)
- Network Security Groups

---

## Local development

### Prerequisites

- Node.js 20
- Azure Functions Core Tools v4
- Azure CLI

### Setup

```bash
git clone https://github.com/latech23/azure-resource-monitor-dashboard.git
cd azure-resource-monitor-dashboard

cd api && npm install
cd ../frontend && npm install
```

### Running locally

```bash
# Terminal 1 — API
cd api
func start

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Visit `http://localhost:5173`

### Environment variables

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

---

## What I took from this

Getting hands-on with how Azure Monitor, DCRs, and Log Analytics actually fit together was probably the biggest thing. It's one of those areas that makes more sense once you've wired it up yourself. Also got comfortable with KQL, setting up a proper CI/CD pipeline, and understanding why Managed Identity is the right approach over storing credentials.
