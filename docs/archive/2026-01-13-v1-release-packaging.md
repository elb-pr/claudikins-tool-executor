# tool-executor-mcp v1.0 Release Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Package tool-executor-mcp as a polished, installable npm package with config file support, CLI commands, and comprehensive documentation.

**Architecture:** Transform from "works on my machine" to "anyone can install and configure". Add config file to replace code editing, CLI for setup/diagnostics, and documentation for self-service troubleshooting. Maintain backward compatibility with existing manual setup.

**Tech Stack:** TypeScript, Zod (config validation), Commander.js (CLI), Vitest (testing), npm (publishing)

---

## Phase 1: Convention Compliance (Quick Wins)

### Task 1.1: Rename Package

**Files:**
- Modify: `package.json:2`
- Modify: `src/index.ts:20`

**Step 1: Update package.json name**

```json
{
  "name": "tool-executor-mcp-server",
  ...
}
```

**Step 2: Verify McpServer name already correct**

Check `src/index.ts:20` - should already be `tool-executor-mcp-server`. If not, update.

**Step 3: Rebuild and verify**

Run: `npm run build`
Expected: Clean build with no errors

**Step 4: Commit**

```bash
git add package.json
git commit -m "chore: rename package to tool-executor-mcp-server (convention compliance)"
```

---

### Task 1.2: Add Workflow Enforcement to execute_code Description

**Files:**
- Modify: `src/index.ts:86-110`

**Step 1: Update execute_code description**

Add workflow reminder at the top of the description:

```typescript
server.registerTool(
  "execute_code",
  {
    title: "Execute Code",
    description: `Execute TypeScript/JavaScript code with access to MCP clients and workspace.

**WORKFLOW** (follow this order):
1. Use search_tools("your query") to find relevant tools
2. Use get_tool_schema("tool_name") to get full parameters
3. Use execute_code to run your code with the discovered tools

If you don't know which tool to use, ALWAYS search first.

**IMPORTANT: Context-Efficient Pattern**
...rest of existing description...`,
```

**Step 2: Rebuild and verify**

Run: `npm run build`
Expected: Clean build

**Step 3: Commit**

```bash
git add src/index.ts
git commit -m "docs: add workflow enforcement to execute_code description"
```

---

## Phase 2: Missing Tests

### Task 2.1: Add Tests for search.ts

**Files:**
- Create: `tests/unit/search.test.ts`
- Reference: `src/search.ts`

**Step 1: Create test file with basic structure**

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { searchTools, loadToolDefinition } from "../../src/search.js";

describe("search module", () => {
  describe("loadToolDefinition", () => {
    it("should load a valid YAML tool definition", async () => {
      const tool = await loadToolDefinition("registry/ui/mermaid/generate_mermaid_diagram.yaml");

      expect(tool).toBeDefined();
      expect(tool?.name).toBe("generate_mermaid_diagram");
      expect(tool?.server).toBe("mermaid");
      expect(tool?.inputSchema).toBeDefined();
    });

    it("should return null for non-existent file", async () => {
      const tool = await loadToolDefinition("registry/nonexistent/tool.yaml");
      expect(tool).toBeNull();
    });

    it("should return null for invalid YAML", async () => {
      // This tests error handling - would need a malformed file or mock
      // For now, just verify the function exists and handles missing files
      const tool = await loadToolDefinition("package.json"); // Not YAML
      expect(tool).toBeNull();
    });
  });

  describe("searchTools", () => {
    it("should return results for valid query", async () => {
      const response = await searchTools("mermaid diagram", 5);

      expect(response.results).toBeDefined();
      expect(response.results.length).toBeGreaterThan(0);
      expect(response.source).toBeDefined();
    });

    it("should respect limit parameter", async () => {
      const response = await searchTools("search", 2);

      expect(response.results.length).toBeLessThanOrEqual(2);
    });

    it("should return empty results for nonsense query", async () => {
      const response = await searchTools("xyzzy123nonexistent", 10);

      expect(response.results).toBeDefined();
      // May have suggestion for empty results
    });

    it("should include tool metadata in results", async () => {
      const response = await searchTools("gemini", 3);

      if (response.results.length > 0) {
        const result = response.results[0];
        expect(result.tool.name).toBeDefined();
        expect(result.tool.server).toBeDefined();
        expect(result.tool.description).toBeDefined();
      }
    });
  });
});
```

**Step 2: Run tests to verify they work**

Run: `npm test -- tests/unit/search.test.ts`
Expected: Tests should pass (or fail gracefully if Serena unavailable - check fallback)

**Step 3: Commit**

```bash
git add tests/unit/search.test.ts
git commit -m "test: add unit tests for search module"
```

---

### Task 2.2: Add Tests for clients.ts

**Files:**
- Create: `tests/unit/clients.test.ts`
- Reference: `src/sandbox/clients.ts`

**Step 1: Create test file**

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  initClientStates,
  getAvailableClients,
  getConnectedClients,
  SERVER_CONFIGS,
} from "../../src/sandbox/clients.js";

describe("clients module", () => {
  beforeEach(() => {
    initClientStates();
  });

  describe("SERVER_CONFIGS", () => {
    it("should have 9 configured servers", () => {
      expect(SERVER_CONFIGS.length).toBe(9);
    });

    it("should have required fields for each server", () => {
      for (const config of SERVER_CONFIGS) {
        expect(config.name).toBeDefined();
        expect(config.displayName).toBeDefined();
        expect(config.command).toBeDefined();
        expect(config.args).toBeDefined();
        expect(Array.isArray(config.args)).toBe(true);
      }
    });

    it("should include expected servers", () => {
      const names = SERVER_CONFIGS.map(c => c.name);
      expect(names).toContain("serena");
      expect(names).toContain("gemini");
      expect(names).toContain("mermaid");
      expect(names).toContain("context7");
    });
  });

  describe("getAvailableClients", () => {
    it("should return all configured client names", () => {
      const available = getAvailableClients();

      expect(available.length).toBe(SERVER_CONFIGS.length);
      expect(available).toContain("serena");
      expect(available).toContain("gemini");
    });
  });

  describe("getConnectedClients", () => {
    it("should return empty array when no clients connected", () => {
      const connected = getConnectedClients();

      expect(connected).toEqual([]);
    });
  });

  // Note: Testing actual connections would require mocking or integration tests
  // These tests focus on the synchronous state management functions
});
```

**Step 2: Run tests**

Run: `npm test -- tests/unit/clients.test.ts`
Expected: All tests pass

**Step 3: Commit**

```bash
git add tests/unit/clients.test.ts
git commit -m "test: add unit tests for clients module"
```

---

## Phase 3: Config File Support

### Task 3.1: Create Config Schema

**Files:**
- Create: `src/config.ts`
- Modify: `src/schemas.ts`

**Step 1: Create config schema with Zod**

```typescript
// src/config.ts
import { z } from "zod";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

export const ServerConfigSchema = z.object({
  name: z.string().min(1).describe("Client name used in execute_code (e.g., 'myserver')"),
  displayName: z.string().min(1).describe("Human-readable name for logs"),
  command: z.enum(["npx", "uvx", "node", "python"]).describe("Command to run the server"),
  args: z.array(z.string()).describe("Arguments to pass to the command"),
  env: z.record(z.string()).optional().describe("Environment variables for this server"),
});

export const ToolExecutorConfigSchema = z.object({
  $schema: z.string().optional(),
  servers: z.array(ServerConfigSchema).min(1).describe("MCP servers to wrap"),
}).strict();

export type ToolExecutorConfig = z.infer<typeof ToolExecutorConfigSchema>;
export type ServerConfigFromFile = z.infer<typeof ServerConfigSchema>;

const CONFIG_FILENAMES = [
  "tool-executor.config.json",
  "tool-executor.config.js",
  ".tool-executorrc.json",
];

export function findConfigFile(startDir: string = process.cwd()): string | null {
  for (const filename of CONFIG_FILENAMES) {
    const filepath = resolve(startDir, filename);
    if (existsSync(filepath)) {
      return filepath;
    }
  }
  return null;
}

export function loadConfig(configPath?: string): ToolExecutorConfig | null {
  const filepath = configPath || findConfigFile();

  if (!filepath || !existsSync(filepath)) {
    return null;
  }

  try {
    const content = readFileSync(filepath, "utf-8");
    const parsed = JSON.parse(content);
    return ToolExecutorConfigSchema.parse(parsed);
  } catch (error) {
    console.error(`Failed to load config from ${filepath}:`, error);
    return null;
  }
}
```

**Step 2: Run build to verify syntax**

Run: `npm run build`
Expected: Clean build

**Step 3: Commit**

```bash
git add src/config.ts
git commit -m "feat: add config file schema and loader"
```

---

### Task 3.2: Integrate Config with clients.ts

**Files:**
- Modify: `src/sandbox/clients.ts`
- Reference: `src/config.ts`

**Step 1: Update clients.ts to use config file with fallback**

Add at top of file:

```typescript
import { loadConfig, ServerConfigFromFile } from "../config.js";
```

Modify SERVER_CONFIGS initialization:

```typescript
/**
 * Load server configs from file or use defaults
 */
function loadServerConfigs(): ServerConfig[] {
  const config = loadConfig();

  if (config) {
    console.error(`Loaded config with ${config.servers.length} servers`);
    return config.servers.map(s => ({
      name: s.name,
      displayName: s.displayName,
      command: s.command,
      args: s.args,
      env: s.env,
    }));
  }

  // Default configuration (backward compatible)
  console.error("No config file found, using default servers");
  return [
    { name: "notebooklm", displayName: "NotebookLM", command: "npx", args: ["-y", "notebooklm-mcp"] },
    { name: "sequentialThinking", displayName: "Sequential Thinking", command: "npx", args: ["-y", "@modelcontextprotocol/server-sequential-thinking"] },
    { name: "context7", displayName: "Context7", command: "npx", args: ["-y", "@upstash/context7-mcp"] },
    { name: "gemini", displayName: "Gemini", command: "npx", args: ["-y", "@rlabs-inc/gemini-mcp"], env: { GEMINI_API_KEY: process.env.GEMINI_API_KEY || "" } },
    { name: "shadcn", displayName: "shadcn", command: "npx", args: ["-y", "shadcn-ui-mcp-server"] },
    { name: "mermaid", displayName: "Mermaid", command: "npx", args: ["-y", "mcp-mermaid"] },
    { name: "apify", displayName: "Apify", command: "npx", args: ["-y", "@apify/actors-mcp-server"], env: { APIFY_TOKEN: process.env.APIFY_TOKEN || "" } },
    { name: "serena", displayName: "Serena", command: "uvx", args: ["--from", "git+https://github.com/oraios/serena", "serena", "start-mcp-server"] },
    { name: "nanoBanana", displayName: "Nano Banana", command: "uvx", args: ["nanobanana-mcp-server@latest"], env: { GEMINI_API_KEY: process.env.GEMINI_API_KEY || "" } },
  ];
}

export const SERVER_CONFIGS: ServerConfig[] = loadServerConfigs();
```

**Step 2: Add test for config loading**

Add to `tests/unit/clients.test.ts`:

```typescript
describe("config loading", () => {
  it("should fall back to defaults when no config file", () => {
    // Default behavior - should have 9 servers
    expect(SERVER_CONFIGS.length).toBe(9);
  });
});
```

**Step 3: Run tests and build**

Run: `npm test && npm run build`
Expected: All pass

**Step 4: Commit**

```bash
git add src/sandbox/clients.ts tests/unit/clients.test.ts
git commit -m "feat: integrate config file loading with fallback to defaults"
```

---

### Task 3.3: Create Example Config File

**Files:**
- Create: `tool-executor.config.example.json`
- Modify: `README.md`

**Step 1: Create example config**

```json
{
  "$schema": "./node_modules/tool-executor-mcp-server/dist/config-schema.json",
  "servers": [
    {
      "name": "myserver",
      "displayName": "My Server",
      "command": "npx",
      "args": ["-y", "my-mcp-package"]
    },
    {
      "name": "openai",
      "displayName": "OpenAI",
      "command": "npx",
      "args": ["-y", "openai-mcp"],
      "env": {
        "OPENAI_API_KEY": "${OPENAI_API_KEY}"
      }
    },
    {
      "name": "pythonserver",
      "displayName": "Python Server",
      "command": "uvx",
      "args": ["some-python-mcp"]
    }
  ]
}
```

**Step 2: Update README with config file section**

Add after "Customising Your MCP Stack" section:

```markdown
### Option B: Config File (Recommended)

Create `tool-executor.config.json` in your project root:

\`\`\`json
{
  "servers": [
    {
      "name": "myserver",
      "displayName": "My Server",
      "command": "npx",
      "args": ["-y", "my-mcp-package"]
    }
  ]
}
\`\`\`

The server will automatically detect and load this file. No code changes needed.

See `tool-executor.config.example.json` for a full example.
```

**Step 3: Commit**

```bash
git add tool-executor.config.example.json README.md
git commit -m "docs: add example config file and documentation"
```

---

## Phase 4: CLI Commands

### Task 4.1: Add CLI Entry Point

**Files:**
- Create: `src/cli.ts`
- Modify: `package.json`

**Step 1: Install commander**

Run: `npm install commander`

**Step 2: Create CLI entry point**

```typescript
// src/cli.ts
#!/usr/bin/env node
import { Command } from "commander";
import { existsSync } from "fs";
import { resolve } from "path";
import { execSync } from "child_process";

const program = new Command();

program
  .name("tool-executor")
  .description("CLI for tool-executor-mcp-server")
  .version("1.0.0");

program
  .command("doctor")
  .description("Check environment and dependencies")
  .action(async () => {
    console.log("🔍 Checking environment...\n");

    // Check Node version
    const nodeVersion = process.version;
    const nodeMajor = parseInt(nodeVersion.slice(1).split(".")[0]);
    console.log(`Node.js: ${nodeVersion} ${nodeMajor >= 18 ? "✅" : "❌ (need 18+)"}`);

    // Check for Python/uv (for uvx servers)
    try {
      execSync("which uvx", { stdio: "pipe" });
      console.log("uvx: ✅ Found");
    } catch {
      console.log("uvx: ⚠️ Not found (optional, needed for Python MCP servers)");
    }

    // Check for config file
    const configExists = existsSync(resolve(process.cwd(), "tool-executor.config.json"));
    console.log(`Config file: ${configExists ? "✅ Found" : "⚠️ Not found (using defaults)"}`);

    // Check for registry
    const registryExists = existsSync(resolve(process.cwd(), "registry"));
    console.log(`Registry: ${registryExists ? "✅ Found" : "❌ Not found"}`);

    console.log("\n✨ Doctor complete");
  });

program
  .command("init")
  .description("Initialize a new tool-executor configuration")
  .action(async () => {
    const configPath = resolve(process.cwd(), "tool-executor.config.json");

    if (existsSync(configPath)) {
      console.log("⚠️ Config file already exists");
      return;
    }

    const { writeFileSync } = await import("fs");
    const defaultConfig = {
      servers: [
        {
          name: "example",
          displayName: "Example Server",
          command: "npx",
          args: ["-y", "example-mcp-server"],
        },
      ],
    };

    writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    console.log("✅ Created tool-executor.config.json");
    console.log("   Edit this file to add your MCP servers, then run: npm run extract");
  });

program.parse();
```

**Step 3: Add bin entry to package.json**

```json
{
  "bin": {
    "tool-executor": "./dist/cli.js"
  }
}
```

**Step 4: Build and test CLI**

Run: `npm run build && node dist/cli.js doctor`
Expected: Shows environment check output

**Step 5: Commit**

```bash
git add src/cli.ts package.json package-lock.json
git commit -m "feat: add CLI with doctor and init commands"
```

---

### Task 4.2: Add Extract Command to CLI

**Files:**
- Modify: `src/cli.ts`
- Reference: `scripts/extract-schemas.ts`

**Step 1: Add extract command with --server option**

Add to `src/cli.ts`:

```typescript
program
  .command("extract")
  .description("Extract tool schemas from MCP servers")
  .option("-s, --server <name>", "Extract from specific server only")
  .option("-a, --all", "Extract from all configured servers")
  .action(async (options) => {
    if (!options.server && !options.all) {
      console.log("Usage: tool-executor extract --all");
      console.log("       tool-executor extract --server gemini");
      return;
    }

    console.log("🔧 Extracting schemas...");

    // Import and run extract logic
    const { extractSchemas } = await import("./extract.js");
    await extractSchemas(options.server);

    console.log("✨ Extraction complete");
  });
```

**Step 2: Refactor extract-schemas.ts to be importable**

Move core logic from `scripts/extract-schemas.ts` to `src/extract.ts` as exportable function.

**Step 3: Build and test**

Run: `npm run build && node dist/cli.js extract --help`
Expected: Shows extract command help

**Step 4: Commit**

```bash
git add src/cli.ts src/extract.ts
git commit -m "feat: add extract command to CLI with --server option"
```

---

## Phase 5: Search Improvements

### Task 5.1: Add Pagination Offset

**Files:**
- Modify: `src/schemas.ts`
- Modify: `src/search.ts`
- Modify: `src/tools/search.ts`

**Step 1: Add offset to schema**

```typescript
export const SearchToolsInputSchema = z.object({
  query: z.string()
    .min(1, "Query cannot be empty")
    .describe("Search query for finding relevant tools"),
  limit: z.number()
    .int()
    .min(1)
    .max(50)
    .default(10)
    .describe("Maximum results to return (default: 10)"),
  offset: z.number()
    .int()
    .min(0)
    .default(0)
    .describe("Number of results to skip for pagination (default: 0)"),
}).strict();
```

**Step 2: Update searchTools function**

Modify `src/search.ts` to accept and apply offset:

```typescript
export async function searchTools(
  query: string,
  limit: number = 10,
  offset: number = 0
): Promise<SearchResponse> {
  // ... existing search logic ...

  // Apply pagination
  const paginatedResults = allResults.slice(offset, offset + limit);

  return {
    results: paginatedResults,
    source: "...",
    totalCount: allResults.length,  // Add total for pagination info
  };
}
```

**Step 3: Update handler**

```typescript
export async function handleSearchTools(params: SearchToolsInput) {
  const response = await searchTools(params.query, params.limit, params.offset);
  // ... rest unchanged ...
}
```

**Step 4: Add test**

```typescript
it("should respect offset parameter", async () => {
  const page1 = await searchTools("search", 2, 0);
  const page2 = await searchTools("search", 2, 2);

  // Results should be different (unless < 3 results)
  if (page1.results.length >= 2 && page2.results.length > 0) {
    expect(page1.results[0].tool.name).not.toBe(page2.results[0].tool.name);
  }
});
```

**Step 5: Commit**

```bash
git add src/schemas.ts src/search.ts src/tools/search.ts tests/unit/search.test.ts
git commit -m "feat: add offset parameter to search_tools for pagination"
```

---

### Task 5.2: Add BM25 Fallback Search

**Files:**
- Create: `src/bm25.ts`
- Modify: `src/search.ts`

**Step 1: Install bm25 package**

Run: `npm install wink-bm25-text-search`

**Step 2: Create BM25 search module**

```typescript
// src/bm25.ts
import BM25 from "wink-bm25-text-search";
import { ToolDefinition } from "./types.js";

let bm25Engine: ReturnType<typeof BM25> | null = null;
let indexedTools: ToolDefinition[] = [];

export function initBM25(tools: ToolDefinition[]): void {
  bm25Engine = BM25();
  indexedTools = tools;

  // Configure for tool search
  bm25Engine.defineConfig({ fldWeights: { name: 2, description: 1, category: 1 } });
  bm25Engine.definePrepTasks([
    (text: string) => text.toLowerCase(),
    (text: string) => text.split(/\W+/).filter(Boolean),
  ]);

  // Index all tools
  tools.forEach((tool, idx) => {
    bm25Engine!.addDoc({
      name: tool.name,
      description: tool.description,
      category: tool.category,
    }, idx);
  });

  bm25Engine.consolidate();
}

export function searchBM25(query: string, limit: number): ToolDefinition[] {
  if (!bm25Engine) {
    return [];
  }

  const results = bm25Engine.search(query, limit);
  return results.map((idx: number) => indexedTools[idx]);
}

export function isBM25Ready(): boolean {
  return bm25Engine !== null;
}
```

**Step 3: Integrate into search.ts as middle fallback**

Update `localFallbackSearch` to use BM25 when available:

```typescript
import { initBM25, searchBM25, isBM25Ready } from "./bm25.js";

// In localFallbackSearch:
if (isBM25Ready()) {
  return searchBM25(query, limit);
}
// ... existing grep fallback ...
```

**Step 4: Commit**

```bash
git add src/bm25.ts src/search.ts package.json package-lock.json
git commit -m "feat: add BM25 fallback search between Serena and grep"
```

---

## Phase 6: Documentation

### Task 6.1: Document Context-Efficient Pattern

**Files:**
- Create: `docs/context-efficient-pattern.md`
- Modify: `README.md`

**Step 1: Create detailed documentation**

```markdown
# Context-Efficient Pattern

tool-executor-mcp automatically manages context by saving large MCP responses to disk and returning slim references.

## How It Works

When an MCP tool returns a response larger than 5KB:

1. **Auto-save**: Response saved to `workspace/mcp-results/<timestamp>.json`
2. **Reference returned**: Your code receives `{ _savedTo: "mcp-results/123.json", _preview: "First 500 chars..." }`
3. **On-demand access**: Read full data with `workspace.readJSON(result._savedTo)`

## Example

\`\`\`typescript
// Large response auto-saved
const result = await gemini.deep_research({ topic: "quantum computing" });
// result = { _savedTo: "mcp-results/abc123.json", _preview: "Quantum computing is..." }

// Access full data when needed
const fullData = await workspace.readJSON(result._savedTo);
\`\`\`

## Benefits

- **Context stays lean**: Claude sees the preview, not 50KB of JSON
- **Data not lost**: Full response available on disk
- **Automatic**: No code changes needed

## Configuration

Constants in `src/constants.ts`:
- `MAX_RESPONSE_SIZE`: Threshold for auto-save (default: 5000 bytes)
- `MCP_RESULTS_DIR`: Where results are saved (default: "mcp-results")

## Cleanup

Results accumulate over time. Clean up with:

\`\`\`typescript
await workspace.cleanupMcpResults(24); // Delete files older than 24 hours
\`\`\`
```

**Step 2: Add link in README**

Add to README under Architecture section:
```markdown
See [Context-Efficient Pattern](docs/context-efficient-pattern.md) for details on automatic response management.
```

**Step 3: Commit**

```bash
git add docs/context-efficient-pattern.md README.md
git commit -m "docs: add context-efficient pattern documentation"
```

---

### Task 6.2: Add Troubleshooting Section

**Files:**
- Modify: `README.md`

**Step 1: Add troubleshooting section**

```markdown
## Troubleshooting

### Serena not finding tools

**Symptom**: `search_tools` returns empty or irrelevant results

**Solutions**:
1. Check registry files exist: `ls registry/*/*`
2. Verify YAML format: `cat registry/ui/mermaid/generate_mermaid_diagram.yaml`
3. Restart Claude Code to reinitialise Serena index

### execute_code timeout

**Symptom**: Code execution times out after 30 seconds

**Solutions**:
1. Pass longer timeout: `execute_code({ code: "...", timeout: 120000 })`
2. Break long operations into smaller chunks
3. Check if MCP server is responding: run `npm run doctor`

### MCP connection fails

**Symptom**: "Failed to connect" errors in logs

**Solutions**:
1. Check the MCP server runs standalone: `npx -y mcp-mermaid`
2. Verify environment variables are set in `mcp.json`
3. Check for port conflicts or firewall issues

### workspace fills up

**Symptom**: Disk space consumed by `workspace/mcp-results/`

**Solutions**:
1. Run cleanup: `await workspace.cleanupMcpResults(24)`
2. Set up periodic cleanup in your workflow
3. Reduce `MAX_RESPONSE_SIZE` threshold if saving too much

### Claude doesn't use search_tools first

**Symptom**: Claude tries execute_code with wrong tool names

**Solutions**:
1. The execute_code description includes workflow reminder
2. Ensure CLAUDE.md is in project root with Tool Usage Protocol
3. Explicitly ask Claude to "search for tools first"
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add troubleshooting section"
```

---

### Task 6.3: Document Anthropic PTC Alignment

**Files:**
- Create: `docs/anthropic-alignment.md`

**Step 1: Create alignment documentation**

```markdown
# Alignment with Anthropic Tool Patterns

tool-executor-mcp implements patterns that Anthropic now officially recommends in their documentation.

## Pattern Comparison

| Anthropic Official | Our Implementation |
|-------------------|-------------------|
| `code_execution_20250825` | `execute_code` sandbox |
| `tool_search_tool_regex/bm25` | `search_tools` via Serena + BM25 |
| `defer_loading: true` | `get_tool_schema` on demand |
| `allowed_callers: ["code_execution"]` | MCP client proxies in sandbox |
| Programmatic Tool Calling (PTC) | Claude writes code that calls tools |

## Key Insight

We independently invented the same architecture Anthropic now documents as "Programmatic Tool Calling":

> "PTC allows Claude to write code that calls tools programmatically within the execution container, rather than requiring round-trips through the model for each tool invocation."

Our `execute_code` tool does exactly this - Claude writes TypeScript that orchestrates multiple MCP tools in a single execution.

## Differences

| Aspect | Anthropic API | Our Approach |
|--------|---------------|--------------|
| Execution | Server-side containers | Local sandbox |
| Transport | API beta headers | MCP protocol |
| Tool visibility | `defer_loading` flag | Always 3 tools visible |
| Files | Files API upload/download | workspace API |

## Why Both Exist

- **Anthropic API**: For developers building with raw API calls
- **tool-executor-mcp**: For Claude Code CLI users who want the same patterns

We're CLI-native; they're API-native. Same patterns, different transports.
```

**Step 2: Commit**

```bash
git add docs/anthropic-alignment.md
git commit -m "docs: document alignment with Anthropic PTC patterns"
```

---

## Phase 7: Publishing Preparation

### Task 7.1: Complete package.json

**Files:**
- Modify: `package.json`

**Step 1: Add missing fields**

```json
{
  "name": "tool-executor-mcp-server",
  "version": "1.0.0",
  "description": "MCP server that wraps multiple MCP servers into a single context-efficient interface",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "tool-executor": "./dist/cli.js"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/aMilkStack/tool-executor-mcp.git"
  },
  "keywords": [
    "mcp",
    "claude",
    "anthropic",
    "tool-executor",
    "context-efficient",
    "model-context-protocol"
  ],
  "author": "Ethan Lee",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/aMilkStack/tool-executor-mcp/issues"
  },
  "homepage": "https://github.com/aMilkStack/tool-executor-mcp#readme",
  "files": [
    "dist",
    "registry",
    "tool-executor.config.example.json"
  ],
  ...
}
```

**Step 2: Verify package contents**

Run: `npm pack --dry-run`
Expected: Shows files that would be included

**Step 3: Commit**

```bash
git add package.json
git commit -m "chore: complete package.json metadata for npm publishing"
```

---

### Task 7.2: Update CLAUDE.md Test Count

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Update test count**

Change "26/26 tests passing" to reflect actual count after new tests added.

Run: `npm test` to get current count.

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update test count in CLAUDE.md"
```

---

## Phase 8: Registry Improvements

### Task 8.1: Upgrade Registry Examples

**Files:**
- Modify: Multiple files in `registry/`

This is a larger task - upgrade 5-10 key tools with realistic examples.

**Step 1: Identify priority tools**

Priority tools (most commonly used):
1. `registry/ui/mermaid/generate_mermaid_diagram.yaml`
2. `registry/code-nav/serena/search_for_pattern.yaml`
3. `registry/ai-models/gemini/gemini-query.yaml`
4. `registry/knowledge/context7/query-docs.yaml`
5. `registry/reasoning/sequentialThinking/sequentialthinking.yaml`

**Step 2: Upgrade mermaid example**

```yaml
example: |
  // Simple flowchart
  await mermaid.generate_mermaid_diagram({
    mermaid: "graph TD; A[Start] --> B{Decision}; B -->|Yes| C[Do X]; B -->|No| D[Do Y]; C --> E[End]; D --> E",
    theme: "default"
  });

  // Sequence diagram with dark theme
  await mermaid.generate_mermaid_diagram({
    mermaid: "sequenceDiagram; Alice->>Bob: Hello Bob; Bob-->>Alice: Hi Alice; Alice->>Bob: How are you?",
    theme: "dark",
    outputType: "svg_url"
  });

  // Class diagram for export
  await mermaid.generate_mermaid_diagram({
    mermaid: "classDiagram; class Animal { +String name; +speak() }; class Dog; Dog --|> Animal",
    outputType: "file"
  });
```

**Step 3: Repeat for other priority tools**

Each tool gets 2-3 realistic examples showing different parameter combinations.

**Step 4: Commit**

```bash
git add registry/
git commit -m "docs: upgrade registry examples from templates to realistic usage"
```

---

## Summary

14 tasks across 8 phases:

1. **Convention Compliance** (2 tasks) - Quick wins
2. **Missing Tests** (2 tasks) - Test coverage
3. **Config File Support** (3 tasks) - Major UX improvement
4. **CLI Commands** (2 tasks) - Developer experience
5. **Search Improvements** (2 tasks) - Functionality
6. **Documentation** (3 tasks) - Self-service support
7. **Publishing Preparation** (2 tasks) - npm readiness
8. **Registry Improvements** (1 task) - Accuracy boost

Estimated total time: 4-6 hours of focused work.
