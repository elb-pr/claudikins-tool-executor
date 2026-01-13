# Tool Executor MCP v1.0 Implementation Plan

**Goal:** Improve from 81/100 audit score to production-ready v1.0
**Estimated items:** 14 tasks across 4 categories
**Approach:** TDD, frequent commits, DRY/YAGNI

---

## Prerequisites

Before starting any task:
```bash
cd /home/ethanlee/projects/tool-executor-mcp
npm test                    # Confirm 26/26 passing
npm run build               # Confirm clean build
```

---

## Phase 1: Foundation (Config & CLI)

### Task 1.1: Config File Support
**Why:** Currently server configs are hardcoded. Users need to customise without editing source.

**Files to modify:**
- `src/config.ts` (NEW) - Config loading logic
- `src/sandbox/clients.ts` - Use config instead of hardcoded `SERVER_CONFIGS`
- `src/types.ts` - Add `ToolExecutorConfig` interface

**Config file location:** `./tool-executor.config.json` (project root)

**Schema:**
```json
{
  "$schema": "./tool-executor.schema.json",
  "servers": {
    "mermaid": {
      "enabled": true,
      "command": "npx",
      "args": ["-y", "@mermaidchart/mermaid-mcp-server"]
    }
  },
  "search": {
    "fallbackToLocal": true,
    "serenaTimeout": 5000
  },
  "sandbox": {
    "defaultTimeout": 30000,
    "idleTimeout": 180000
  }
}
```

**Test file:** `tests/unit/config.test.ts`
- Test: loads valid config
- Test: falls back to defaults if missing
- Test: validates schema (rejects invalid)
- Test: merges partial config with defaults

**Implementation steps:**
1. Write tests first
2. Create `src/config.ts` with `loadConfig()` function
3. Add Zod schema for config validation
4. Update `clients.ts` to call `loadConfig()` on init
5. Generate JSON schema for IDE autocomplete

**Commit:** `feat(config): add config file support`

---

### Task 1.2: CLI Commands
**Why:** Users need `npx tool-executor init`, `doctor`, `extract --server=X`

**Files to modify:**
- `src/cli.ts` (NEW) - CLI entry point
- `package.json` - Add `bin` field
- `scripts/extract-schemas.ts` - Refactor to be importable

**Commands:**
```bash
npx tool-executor init      # Create config + registry scaffold
npx tool-executor doctor    # Check MCP server connectivity
npx tool-executor extract   # Regenerate all registry
npx tool-executor extract --server=mermaid  # Single server
```

**Test file:** `tests/unit/cli.test.ts`
- Test: `init` creates config file
- Test: `doctor` reports server status
- Test: `extract` calls extraction logic

**Implementation steps:**
1. Write tests using mock process.argv
2. Create `src/cli.ts` with commander.js or yargs
3. Add `"bin": { "tool-executor": "./dist/cli.js" }` to package.json
4. Refactor `extract-schemas.ts` to export functions
5. Wire up CLI commands

**Commit:** `feat(cli): add init, doctor, extract commands`

---

### Task 1.3: Package.json Metadata
**Why:** npm publish requires complete metadata

**Files to modify:**
- `package.json`

**Add/update:**
```json
{
  "description": "MCP server that wraps multiple MCP servers into a context-efficient interface",
  "keywords": ["mcp", "claude", "anthropic", "tool-executor"],
  "author": "Ethan Lee",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/ethanlee/tool-executor-mcp"
  },
  "bugs": "https://github.com/ethanlee/tool-executor-mcp/issues",
  "homepage": "https://github.com/ethanlee/tool-executor-mcp#readme",
  "engines": { "node": ">=18" },
  "files": ["dist", "registry", "tool-executor.schema.json"]
}
```

**No tests needed** - manual verification via `npm pack --dry-run`

**Commit:** `chore(package): complete npm metadata`

---

## Phase 2: Error Handling & Reliability

### Task 2.1: Structured Error Types
**Why:** Current errors are strings. Need typed errors for better handling.

**Files to modify:**
- `src/errors.ts` (NEW) - Custom error classes
- `src/sandbox/runtime.ts` - Use new error types
- `src/sandbox/clients.ts` - Use new error types
- `src/search.ts` - Use new error types

**Error types:**
```typescript
export class ToolExecutorError extends Error {
  constructor(message: string, public code: string, public details?: unknown) {
    super(message);
    this.name = 'ToolExecutorError';
  }
}

export class ConnectionError extends ToolExecutorError {}
export class TimeoutError extends ToolExecutorError {}
export class ValidationError extends ToolExecutorError {}
export class ExecutionError extends ToolExecutorError {}
```

**Test file:** `tests/unit/errors.test.ts`
- Test: error instanceof checks work
- Test: error codes are set correctly
- Test: details are preserved

**Implementation steps:**
1. Create error classes
2. Replace string errors in runtime.ts
3. Replace string errors in clients.ts
4. Update handlers to catch typed errors

**Commit:** `feat(errors): add structured error types`

---

### Task 2.2: Retry Logic for MCP Connections
**Why:** Transient failures should retry before failing.

**Files to modify:**
- `src/sandbox/clients.ts` - Add retry wrapper

**Config:**
```typescript
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2
};
```

**Test file:** Update `tests/integration/execute-code.test.ts`
- Test: retries on transient failure
- Test: gives up after max retries
- Test: exponential backoff timing

**Implementation steps:**
1. Add retry helper function with exponential backoff
2. Wrap `connectClientInternal()` with retry logic
3. Add retry count to audit log

**Commit:** `feat(clients): add retry logic with exponential backoff`

---

### Task 2.3: Connection Pooling
**Why:** Currently one connection per server. Pool allows concurrent calls.

**Files to modify:**
- `src/sandbox/clients.ts` - Add pool management

**Design:**
- Pool size: 1-3 connections per server
- Acquire/release pattern
- Health checks before reuse

**Test file:** `tests/integration/connection-pool.test.ts` (NEW)
- Test: concurrent calls use different connections
- Test: connections return to pool after use
- Test: unhealthy connections are replaced

**Implementation steps:**
1. Create `ConnectionPool` class
2. Refactor `getClient()` to use pool
3. Add health check ping before reuse
4. Update lifecycle management

**Commit:** `feat(clients): add connection pooling`

---

## Phase 3: Search & Discovery Improvements

### Task 3.1: BM25 Fallback Search
**Why:** Gap between Serena (semantic) and grep (literal). BM25 bridges it.

**Files to modify:**
- `src/search.ts` - Add BM25 scoring
- `package.json` - Add `wink-bm25-text-search` or similar

**Search cascade:**
1. Serena (semantic) - 5s timeout
2. BM25 (term frequency + IDF) - local
3. Grep (literal match) - local

**Test file:** `tests/unit/search.test.ts` (NEW)
- Test: BM25 ranks exact matches higher
- Test: BM25 handles partial matches
- Test: fallback cascade works

**Implementation steps:**
1. Add BM25 library
2. Index registry on startup
3. Add `bm25Search()` function
4. Update `searchTools()` cascade

**Commit:** `feat(search): add BM25 fallback between Serena and grep`

---

### Task 3.2: Upgrade Registry Examples
**Why:** Current examples are templates with placeholders. Real examples improve Claude accuracy 72% → 90%.

**Files to modify:**
- `registry/**/*.yaml` - All 102 tool files

**Before:**
```yaml
example: |
  await mermaid.generate_diagram({
    mermaid: "<mermaid>",
    theme: "<theme>"
  });
```

**After:**
```yaml
examples:
  - name: "Simple flowchart"
    code: |
      const result = await mermaid.generate_diagram({
        mermaid: "graph TD; A[Start] --> B[End]",
        theme: "default"
      });
      console.log(result);
  - name: "Sequence diagram with styling"
    code: |
      const result = await mermaid.generate_diagram({
        mermaid: `sequenceDiagram
          Alice->>Bob: Hello
          Bob->>Alice: Hi back`,
        theme: "dark"
      });
```

**Test file:** `tests/unit/registry.test.ts` (NEW)
- Test: all YAML files have `examples` array
- Test: each example has `name` and `code`
- Test: code is syntactically valid

**Implementation steps:**
1. Create registry validation test
2. Update schema in `scripts/extract-schemas.ts`
3. Manually enhance top 20 most-used tools first
4. Script to convert remaining tools

**Commit:** `feat(registry): upgrade to realistic multi-example format`

---

### Task 3.3: Tool Categories in Search Results
**Why:** Results should show category for context.

**Files to modify:**
- `src/types.ts` - Add `category` to `SearchResult`
- `src/search.ts` - Include category in results
- `src/tools/search.ts` - Format category in output

**Test:** Update existing search tests

**Commit:** `feat(search): include category in search results`

---

## Phase 4: Documentation & Observability

### Task 4.1: Workflow Enforcement in Tool Descriptions
**Why:** Claude needs to know to call `search_tools` before `execute_code`.

**Files to modify:**
- `src/index.ts` - Update tool descriptions

**New execute_code description:**
```typescript
description: `Execute TypeScript/JavaScript code with MCP clients.

**REQUIRED WORKFLOW:**
1. search_tools("your query") - Find relevant tools
2. get_tool_schema("tool_name") - Get full parameters
3. execute_code - Run your code

Available clients: ${Object.keys(SERVER_CONFIGS).join(", ")}

If unsure which tool to use, ALWAYS search first.`
```

**No new tests** - manual verification

**Commit:** `docs(tools): add workflow guidance to descriptions`

---

### Task 4.2: Metrics & Logging
**Why:** Need visibility into performance and errors.

**Files to modify:**
- `src/metrics.ts` (NEW) - Metrics collection
- `src/sandbox/clients.ts` - Record connection metrics
- `src/sandbox/runtime.ts` - Record execution metrics

**Metrics to track:**
```typescript
interface Metrics {
  connections: { server: string; durationMs: number; success: boolean }[];
  executions: { durationMs: number; success: boolean; clientsUsed: string[] }[];
  searches: { query: string; durationMs: number; resultCount: number; source: string }[];
}
```

**Expose via:** New `get_metrics` tool (optional, debug only)

**Test file:** `tests/unit/metrics.test.ts`
- Test: metrics recorded correctly
- Test: metrics cleared on request

**Commit:** `feat(metrics): add performance metrics collection`

---

### Task 4.3: Input Validation with Helpful Errors
**Why:** Current validation errors are cryptic.

**Files to modify:**
- `src/schemas.ts` - Add custom error messages to Zod schemas

**Before:**
```
Invalid input: Expected string, received undefined
```

**After:**
```
Invalid input for search_tools:
  - query: Required. Example: "generate diagram"
  - limit: Must be 1-50, got 100
```

**Test:** Update existing schema tests

**Commit:** `feat(validation): add helpful error messages`

---

### Task 4.4: README with Examples
**Why:** Current README is sparse.

**Files to modify:**
- `README.md`

**Sections:**
1. What it does (with diagram)
2. Quick start
3. Configuration
4. Available tools
5. Adding new MCP servers
6. Troubleshooting

**No tests** - manual review

**Commit:** `docs(readme): comprehensive documentation`

---

## Execution Order

```
Phase 1 (Foundation)     Phase 2 (Reliability)    Phase 3 (Search)         Phase 4 (Docs)
─────────────────────    ────────────────────     ────────────────────     ────────────────
1.1 Config file     ──┬──► 2.1 Error types    ──┬──► 3.1 BM25 search    ──► 4.1 Workflow desc
1.2 CLI commands    ──┤                        │     3.2 Registry examples   4.2 Metrics
1.3 Package.json    ──┘    2.2 Retry logic    ──┤     3.3 Categories         4.3 Validation
                           2.3 Connection pool ─┘                            4.4 README
```

**Dependencies:**
- 1.1 (Config) before 2.2 (Retry) - retry config lives in config file
- 2.1 (Error types) before 2.2, 2.3 - they use typed errors
- 3.1 (BM25) and 3.2 (Examples) are independent

---

## Verification Checklist

After each task:
- [ ] `npm test` passes (26+ tests)
- [ ] `npm run build` succeeds
- [ ] Manual test with Claude Code
- [ ] Commit with conventional format

After all tasks:
- [ ] Run full audit again
- [ ] Target score: 90+/100
- [ ] `npm pack --dry-run` looks correct
- [ ] Tag as v1.0.0

---

## Time Estimates

| Phase | Tasks | Complexity |
|-------|-------|------------|
| Phase 1 | 3 | Medium - new files, package.json |
| Phase 2 | 3 | High - async/retry/pool patterns |
| Phase 3 | 3 | Medium - search logic, YAML updates |
| Phase 4 | 4 | Low - docs and messages |

**Total:** 13 tasks (Task 3.2 is largest - 102 YAML files)

---

## Notes

- **YAGNI:** Skip connection pooling (2.3) if single connection performs well
- **DRY:** Config schema used for both validation and JSON schema generation
- **TDD:** Every new file gets a test file first
- **Commits:** One commit per task, squash if needed before merge
