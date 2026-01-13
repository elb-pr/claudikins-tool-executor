import { z } from "zod";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

export const ServerConfigSchema = z.object({
  name: z.string().min(1),
  displayName: z.string().min(1),
  command: z.enum(["npx", "uvx", "node", "python"]),
  args: z.array(z.string()),
  env: z.record(z.string(), z.string()).optional(),
});

export const ToolExecutorConfigSchema = z.object({
  $schema: z.string().optional(),
  servers: z.array(ServerConfigSchema).min(1),
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
