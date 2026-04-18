const { app } = require('@azure/functions');
const { LogsQueryClient } = require("@azure/monitor-query");
const { DefaultAzureCredential } = require("@azure/identity");

app.http('getMetrics', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('getMetrics function triggered');

        try {
            const credential = new DefaultAzureCredential();
            const client = new LogsQueryClient(credential);
            const workspaceId = process.env.LOG_ANALYTICS_WORKSPACE_ID;

            const query = `
                Perf
                | where ObjectName == "Processor" and CounterName == "% Processor Time"
                | where TimeGenerated > ago(1h)
                | summarize AvgCPU = avg(CounterValue) by bin(TimeGenerated, 5m)
                | order by TimeGenerated asc
            `;

            const result = await client.queryWorkspace(workspaceId, query, {
                duration: "PT1H"
            });

            const rows = result.tables[0].rows.map(row => ({
                time: row[0],
                avgCPU: row[1]
            }));

            return {
                status: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ metrics: rows })
            };

        } catch (error) {
            context.error('Error querying metrics:', error);
            return {
                status: 500,
                body: JSON.stringify({ error: error.message })
            };
        }
    }
});