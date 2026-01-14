import { z } from "zod";
export declare const ServerConfigSchema: z.ZodObject<{
    name: z.ZodString;
    displayName: z.ZodString;
    command: z.ZodEnum<{
        npx: "npx";
        uvx: "uvx";
        node: "node";
        python: "python";
    }>;
    args: z.ZodArray<z.ZodString>;
    env: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$strip>;
export declare const ToolExecutorConfigSchema: z.ZodObject<{
    $schema: z.ZodOptional<z.ZodString>;
    servers: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        displayName: z.ZodString;
        command: z.ZodEnum<{
            npx: "npx";
            uvx: "uvx";
            node: "node";
            python: "python";
        }>;
        args: z.ZodArray<z.ZodString>;
        env: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, z.core.$strip>>;
}, z.core.$strict>;
export type ToolExecutorConfig = z.infer<typeof ToolExecutorConfigSchema>;
export type ServerConfigFromFile = z.infer<typeof ServerConfigSchema>;
export declare function findConfigFile(startDir?: string): string | null;
export declare function loadConfig(configPath?: string): ToolExecutorConfig | null;
