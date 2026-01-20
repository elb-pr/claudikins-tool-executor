---
name: claudikins-tool-executor:doctor
description: Diagnose Tool Executor issues - run tests, check health, troubleshoot
argument-hint: <mode: test|health|reset> [--verbose]
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - Skill
skills:
  - te-doctor
---

# claudikins-tool-executor:doctor Command

You are orchestrating Tool Executor diagnostics with clear reporting at each step.

## Arguments

- `test` → Run `npm test` and report results (43 tests expected)
- `health` → Check build status, registry integrity, workspace state
- `reset` → Guide through full reset (clean + reinstall + rebuild)
- `--verbose` → Show detailed output for any mode
- No argument → Run quick health check (build + test)

## Workflow

1. Load the te-doctor skill for methodology
2. Run the requested diagnostic mode
3. Parse and present results clearly
4. Provide actionable next steps based on findings

## Health Check Items

| Check | Command | Expected |
|-------|---------|----------|
| Build current | `npm run build` | Exit 0 |
| Tests pass | `npm test` | 43 passing |
| Registry valid | Check `registry/*.json` | Valid JSON |
| Workspace clean | Check `./workspace/` | Exists, writable |

## Critical Facts

- **43 tests** - Unit tests for workspace, clients, search; integration tests for execute_code
- **Build required** - Always run `npm run build` after code changes
- **Serena health** - Two instances must be running for full functionality
