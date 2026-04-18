const { app } = require('@azure/functions');
const { DefaultAzureCredential } = require("@azure/identity");
const { MetricsQueryClient } = require("@azure/monitor-query");

app.http('getStorageMetrics', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('getStorageMetrics function triggered');

        try {
            const credential = new DefaultAzureCredential();
            const client = new MetricsQueryClient(credential);

            const storageResourceId = `/subscriptions/ad9d4670-e9bb-4708-8c88-743a1cd6efcf/resourceGroups/rg-monitor-dashboard/providers/Microsoft.Storage/storageAccounts/stmonitordashboard`;

            const result = await client.queryResource(storageResourceId, ["UsedCapacity"], {
                granularity: "PT1H",
                duration: "PT24H"
            });

            const metric = result.metrics[0];
            const dataPoints = metric.timeseries[0].data.map(point => ({
                time: point.timeStamp,
                usedCapacity: point.average
            }));

            return {
                status: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ storage: dataPoints })
            };

        } catch (error) {
            context.log.error('Error querying storage metrics:', error);
            return {
                status: 500,
                body: JSON.stringify({ error: error.message })
            };
        }
    }
});