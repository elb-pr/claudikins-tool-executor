import { ToolDefinition } from "./types.js";
/**
 * Search result from tool search
 */
export interface SearchResult {
    tool: ToolDefinition;
    score: number;
    matchContext?: string;
}
/**
 * Search response
 */
export interface SearchResponse {
    results: SearchResult[];
    source: "serena" | "local";
    totalCount?: number;
    suggestion?: string;
    fallbackReason?: string;
}
/**
 * Load a tool definition from a YAML file
 */
export declare function loadToolDefinition(filePath: string): Promise<ToolDefinition | null>;
/**
 * Search for tools matching a query
 */
export declare function searchTools(query: string, limit?: number, offset?: number): Promise<SearchResponse>;
/**
 * Get all available categories in the registry
 */
export declare function getCategories(): Promise<string[]>;
/**
 * List all tools in a category
 */
export declare function listToolsInCategory(category: string): Promise<ToolDefinition[]>;
/**
 * Get a specific tool by name (for full schema retrieval)
 */
export declare function getToolByName(toolName: string): Promise<ToolDefinition | null>;
/**
 * Disconnect the registry Serena client (for cleanup)
 */
export declare function disconnectRegistrySerena(): Promise<void>;
