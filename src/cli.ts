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
    console.log("   Edit this file to add your MCP servers, then run: tool-executor extract");
  });

program
  .command("extract")
  .description("Extract tool schemas from MCP servers into registry")
  .option("-a, --all", "Extract from all configured servers")
  .action(async (options) => {
    if (!options.all) {
      console.log("Usage: tool-executor extract --all");
      console.log("\nExtracts tool schemas from all configured MCP servers");
      console.log("and generates YAML files in the registry/ directory.");
      return;
    }

    console.log("🔧 Extracting schemas from MCP servers...\n");

    // Run the extract script via tsx
    const scriptPath = resolve(process.cwd(), "scripts/extract-schemas.ts");
    if (!existsSync(scriptPath)) {
      console.error("❌ Extract script not found at scripts/extract-schemas.ts");
      console.error("   Make sure you're in the tool-executor-mcp directory");
      process.exit(1);
    }

    try {
      execSync(`npx tsx ${scriptPath}`, { stdio: "inherit" });
      console.log("\n✨ Extraction complete");
    } catch (error) {
      console.error("\n❌ Extraction failed");
      process.exit(1);
    }
  });

program.parse();
