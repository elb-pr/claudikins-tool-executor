import { ExecutionResult } from "../types.js";
/**
 * Execute TypeScript/JavaScript code in a sandboxed environment
 */
export declare function executeCode(code: string, timeout?: number): Promise<ExecutionResult>;
/**
 * Get a list of available MCP clients (for error messages)
 */
export declare function getAvailableClientNames(): string[];
