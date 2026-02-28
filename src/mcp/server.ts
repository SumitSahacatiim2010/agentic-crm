import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerTools } from './tools';

async function main() {
    // 1. Initialize MCP Server
    const server = new Server(
        {
            name: "bankingcrm-headless-services",
            version: "1.0.0"
        },
        {
            capabilities: {
                tools: {}
            }
        }
    );

    // 2. Register Tool Handlers
    registerTools(server);

    // 3. Connect Transport
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error('MCP Server [bankingcrm-headless-services] running on stdio');
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
