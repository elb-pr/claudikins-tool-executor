---
name: claudikins-tool-executor:guide
description: Learn how to use the Tool Executor - 3-tool workflow, workspace API, MCP clients
argument-hint: [topic: workflow|workspace|mcp|patterns]
allowed-tools:
  - Read
  - Glob
  - Grep
  - Skill
skills:
  - te-guide
---

# claudikins-tool-executor:guide Command

You are teaching Tool Executor usage with clear examples and explanations.

## Arguments

- `workflow` or `tools` → Focus on search_tools → get_tool_schema → execute_code flow
- `workspace` → Focus on workspace API methods
- `mcp` or `clients` → Focus on available MCP clients and usage patterns
- `patterns` or `examples` → Focus on common code patterns
- No argument → Provide overview of the 3-tool workflow

## The 3-Tool Workflow

```
1. search_tools("what you want to do")
   → Returns ranked list of relevant tools

2. get_tool_schema("tool_name")
   → Returns full inputSchema for the tool

3. execute_code(`
     const result = await mcp.tool_name({...});
     workspace.write("output.json", result);
   `)
   → Runs TypeScript in sandbox with MCP clients
```

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Semantic Search** | Serena-powered with BM25 fallback over 102 tools |
| **Workspace API** | Sandboxed file operations in `./workspace/` |
| **Lazy Loading** | MCP clients connect on first use, disconnect after 3 mins |
| **Context Efficiency** | Large responses (>200 chars) auto-saved to workspace |

## Critical Facts

- **97% context reduction** - 48k tokens down to 1.1k
- **9 MCP servers** - Wrapped into 3 context-efficient tools
- **Sandbox isolation** - All paths scoped to `./workspace/`
