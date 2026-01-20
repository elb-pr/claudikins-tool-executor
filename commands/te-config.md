---
name: claudikins-tool-executor:config
description: Configure Tool Executor - add/remove MCP servers, set environment variables
argument-hint: <action: add|remove|list|env> [server-name]
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
  - Glob
  - Grep
  - Skill
skills:
  - te-config
---

# claudikins-tool-executor:config Command

You are orchestrating Tool Executor configuration changes with user guidance at each step.

## Arguments

- `add` → Guide through adding a new MCP server
- `remove` → Guide through removing an MCP server (warn: Serena cannot be removed)
- `list` → Show currently configured servers from clients.ts or config file
- `env` → Help configure environment variables
- No argument → Show overview of configuration options

## Workflow

1. Load the te-config skill for methodology
2. Identify what configuration change is needed
3. Guide user through the change step by step
4. Validate the configuration after changes
5. Remind user to rebuild and restart

## Post-Configuration

After any configuration changes, remind the user to:
1. Run `npm run build`
2. Restart Claude Code

## Critical Facts

- **Serena is mandatory** - Two instances, neither removable
- **Config location** - `src/sandbox/clients.ts` for MCP servers
- **Environment variables** - Set in shell profile or `.env` file
