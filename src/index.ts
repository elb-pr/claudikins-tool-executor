import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import {
  SearchToolsInputSchema,
  GetToolSchemaInputSchema,
  ExecuteCodeInputSchema,
} from "./schemas.js";
import {
  handleSearchTools,
  handleGetToolSchema,
  handleExecuteCode,
} from "./tools/index.js";
import { startLifecycleManagement } from "./sandbox/clients.js";
import { getAvailableClientNames } from "./sandbox/runtime.js";

const server = new McpServer({
  name: "tool-executor-mcp-server",
  version: "1.0.0",
});

/**
 * Tool: search_tools
 * Search for MCP tools across all wrapped servers
 */
server.registerTool(
  "search_tools",
  {
    title: "Search MCP Tools",
    description: `Search for MCP tools across all wrapped servers. Returns slim results (name, server, description, example) for discovery.

Use get_tool_schema(name) to get the full inputSchema when you're ready to call a specific tool.

Available categories: game-dev, code-nav, knowledge, ai-models, web, source-control, ui, reasoning, debugging, misc

Example queries:
- "godot scene" - tools for Godot game development
- "semantic code search" - Serena code navigation
- "generate diagram" - Mermaid diagram tools
- "fetch webpage" - HTTP fetch tools`,
    inputSchema: SearchToolsInputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  handleSearchTools
);

/**
 * Tool: get_tool_schema
 * Get full inputSchema for a specific tool
 */
server.registerTool(
  "get_tool_schema",
  {
    title: "Get Tool Schema",
    description: `Get the full inputSchema for a specific tool. Use after search_tools to get parameter details before calling execute_code.

Example: get_tool_schema("generate_mermaid_diagram") - returns full schema with all parameters, types, enums, etc.`,
    inputSchema: GetToolSchemaInputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  handleGetToolSchema
);

/**
 * Tool: execute_code
 * Execute TypeScript/JavaScript code in sandbox
 */
const clientList = getAvailableClientNames().map((n) => `- ${n}`).join("\n");

server.registerTool(
  "execute_code",
  {
    title: "Execute Code",
    description: `Execute TypeScript/JavaScript code with access to all MCP clients and workspace helpers.

**Available MCP clients (call as async functions):**
${clientList}

**Workspace API (file operations scoped to ./workspace/):**
- workspace.read(path), workspace.write(path, data)
- workspace.readJSON(path), workspace.writeJSON(path, data)
- workspace.list(path), workspace.glob(pattern)
- workspace.exists(path), workspace.mkdir(path)

**Example:**
\`\`\`typescript
// Search code with Serena
const result = await serena.search_for_pattern({
  substring_pattern: "handleError",
  relative_path: "src"
});
console.log(result);

// Save data to workspace
await workspace.writeJSON("results.json", result);
\`\`\`

Code runs in a sandbox. Results are returned as logs array.`,
    inputSchema: ExecuteCodeInputSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  handleExecuteCode
);

/**
 * Main entry point
 */
async function main() {
  startLifecycleManagement();

  // Exit gracefully when client disconnects (prevents orphan processes)
  process.stdin.on("close", () => {
    console.error("Client disconnected, shutting down");
    process.exit(0);
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("Tool Executor MCP running");
  console.error(`Available MCP clients: ${getAvailableClientNames().join(", ")}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
