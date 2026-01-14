import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { MCPClients, ServerConfig, AuditLogEntry } from "../types.js";
export declare function getServerConfigs(): ServerConfig[];
export declare const SERVER_CONFIGS: ServerConfig[];
/**
 * Initialize client states (all disconnected)
 */
export declare function initClientStates(): void;
/**
 * Get a client, connecting lazily if needed
 */
export declare function getClient(name: keyof MCPClients): Promise<Client | null>;
/**
 * Disconnect a specific client
 */
export declare function disconnectClient(name: keyof MCPClients): Promise<void>;
/**
 * Disconnect all clients
 */
export declare function disconnectAll(): Promise<void>;
/**
 * Clean up idle clients (run periodically)
 */
export declare function cleanupIdleClients(): Promise<void>;
/**
 * Get list of currently connected clients
 */
export declare function getConnectedClients(): string[];
/**
 * Get list of all available clients (connected or not)
 */
export declare function getAvailableClients(): string[];
/**
 * Log an MCP call for auditing
 */
export declare function logMcpCall(entry: AuditLogEntry): void;
/**
 * Get recent audit log entries
 */
export declare function getAuditLog(limit?: number): AuditLogEntry[];
export declare function startLifecycleManagement(): void;
/**
 * Stop lifecycle management (for testing)
 */
export declare function stopLifecycleManagement(): void;
