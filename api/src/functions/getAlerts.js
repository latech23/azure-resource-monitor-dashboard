const { app } = require('@azure/functions');
const { TableClient } = require("@azure/data-tables");

app.http('getAlerts', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('getAlerts function triggered');

        try {
            const connectionString = process.env.STORAGE_CONNECTION_STRING;
            const tableClient = TableClient.fromConnectionString(connectionString, "alerts");

            if (request.method === "POST") {
                const body = await request.json();
                const { resourceName, severity, message } = body;

                const alert = {
                    partitionKey: severity,
                    rowKey: Date.now().toString(),
                    resourceName,
                    severity,
                    message,
                    timestamp: new Date().toISOString(),
                    resolved: false
                };

                await tableClient.createEntity(alert);

                return {
                    status: 201,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: "Alert created", alert })
                };

            } else {
                const alerts = [];
                const entities = tableClient.listEntities();

                for await (const entity of entities) {
                    alerts.push({
                        id: entity.rowKey,
                        resourceName: entity.resourceName,
                        severity: entity.severity,
                        message: entity.message,
                        timestamp: entity.timestamp,
                        resolved: entity.resolved
                    });
                }

                return {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ alerts })
                };
            }

        } catch (error) {
            context.error('Error with alerts:', error);
            return {
                status: 500,
                body: JSON.stringify({ error: error.message })
            };
        }
    }
});